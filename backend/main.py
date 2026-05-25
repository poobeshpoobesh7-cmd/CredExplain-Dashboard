from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json

import models, schemas, database, ml_service

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="CredExplain API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/predict", response_model=schemas.PredictionResponse)
def predict(app_data: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    # Create DB record for application
    db_app = models.Application(**app_data.model_dump())
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    
    # Predict
    pred_res = ml_service.predict_loan(app_data)
    
    db_pred = models.Prediction(
        application_id=db_app.id,
        decision=pred_res["decision"],
        probability=pred_res["probability"],
        risk_level=pred_res["risk_level"],
        model_used=pred_res["model_used"]
    )
    db.add(db_pred)
    db.commit()
    db.refresh(db_pred)
    
    # Background generation of explainer data (simulated synchronous here)
    exp_res = ml_service.explain_loan(app_data, pred_res)
    db_exp = models.Explanation(
        prediction_id=db_pred.id,
        shap_data=json.dumps(exp_res["shap_values"]),
        explanation_text=exp_res["explanation"]
    )
    db.add(db_exp)
    db.commit()
    
    return pred_res

@app.post("/explain", response_model=schemas.ExplainResponse)
def explain(app_data: schemas.ApplicationCreate):
    # This endpoint is to fetch explanation locally if needed for demo
    pred_res = ml_service.predict_loan(app_data)
    exp_res = ml_service.explain_loan(app_data, pred_res)
    return exp_res

@app.get("/models")
def get_models():
    return ml_service.get_models_info()

@app.get("/applications", response_model=list[schemas.ApplicationSummary])
def get_applications(db: Session = Depends(get_db)):
    apps = db.query(models.Application).order_by(models.Application.timestamp.desc()).all()
    results = []
    for a in apps:
        decision = None
        risk = None
        if a.predictions:
            decision = a.predictions[0].decision
            risk = a.predictions[0].risk_level
            
        results.append({
            "id": a.id,
            "name": a.name,
            "annual_income": a.annual_income,
            "loan_amount_requested": a.loan_amount_requested,
            "decision": decision,
            "risk_level": risk,
            "timestamp": a.timestamp
        })
    return results

@app.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    total = db.query(models.Application).count()
    if total == 0:
        return {"total_applications": 0, "approval_rate": 0, "avg_credit_score": 0, "risk_distribution": {}, "decision_distribution": {}}
        
    preds = db.query(models.Prediction).all()
    approved = sum(1 for p in preds if p.decision == "Approve")
    manual = sum(1 for p in preds if p.decision == "Manual Review")
    rejected = sum(1 for p in preds if p.decision == "Reject")
    
    avg_prob = sum(p.probability for p in preds) / len(preds) if preds else 0
    avg_score = 300 + (avg_prob * 600)
    
    low_risk = sum(1 for p in preds if p.risk_level == "Low")
    med_risk = sum(1 for p in preds if p.risk_level == "Medium")
    high_risk = sum(1 for p in preds if p.risk_level == "High")

    return {
        "total_applications": total,
        "approval_rate": round(approved / total * 100, 1) if total > 0 else 0,
        "avg_credit_score": int(avg_score),
        "risk_distribution": {"Low": low_risk, "Medium": med_risk, "High": high_risk},
        "decision_distribution": {"Approve": approved, "Manual Review": manual, "Reject": rejected}
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
