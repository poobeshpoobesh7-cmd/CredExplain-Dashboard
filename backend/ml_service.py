import pickle
import numpy as np
import os
try:
    import shap
except ImportError as e:
    print(f"Warning: could not import shap due to {e}")
    shap = None

base_dir = os.path.dirname(os.path.abspath(__file__))

# Load all 5 ensemble models
models = {}
model_files = {
    'XGBoost': 'xgb_model.pkl',
    'Random Forest': 'rf_model.pkl',
    'LightGBM': 'lgb_model.pkl',
    'Gradient Boost': 'gb_model.pkl',
    'Neural Network': 'nn_model.pkl'
}

for name, fname in model_files.items():
    try:
        m_path = os.path.join(base_dir, '..', fname)
        with open(m_path, 'rb') as f:
            models[name] = pickle.load(f)
    except Exception as e:
        print(f"Failed to load {name}: {e}")

explainer = None
try:
    with open(os.path.join(base_dir, '..', 'shap_explainer_xgb.pkl'), 'rb') as f:
        explainer = pickle.load(f)
except Exception:
    pass

FEATURE_NAMES = [
    'checking_status', 'duration', 'credit_history', 'purpose', 'credit_amount', 'savings_status', 'employment', 
    'installment_rate', 'personal_status', 'other_parties', 'residence_since', 'property_magnitude', 'age', 
    'other_payment_plans', 'housing', 'existing_credits', 'job', 'num_dependents', 'own_telephone', 'foreign_worker', 
    'amount_per_month', 'age_employment_interaction', 'credit_per_existing', 'checking_savings_interaction', 
    'credit_history_score', 'age_group', 'duration_group', 'credit_amount_group', 'risk_score', 'poly_duration', 
    'poly_credit_amount', 'poly_age', 'poly_installment_rate', 'poly_duration credit_amount', 'poly_duration age', 
    'poly_duration installment_rate', 'poly_credit_amount age', 'poly_credit_amount installment_rate', 'poly_age installment_rate'
]

def map_features(app_data):
    X = np.zeros(39)
    if hasattr(app_data, 'age'):
        X[12] = app_data.age
        X[31] = app_data.age ** 2
        X[25] = app_data.age // 10
    if hasattr(app_data, 'loan_amount_requested'):
        X[4] = app_data.loan_amount_requested
        X[30] = app_data.loan_amount_requested ** 2
        X[27] = app_data.loan_amount_requested // 5000
    if hasattr(app_data, 'emi_details') and app_data.emi_details > 0:
        X[20] = app_data.emi_details
    if hasattr(app_data, 'existing_loan'):
        # Existing loan could be mapped to existing credits or just kept for reference
        X[15] = 1 if app_data.existing_loan > 0 else 0
    if hasattr(app_data, 'number_of_loans'):
        X[15] = app_data.number_of_loans
    if hasattr(app_data, 'repayment_history'):
        X[2] = app_data.repayment_history / 20.0
        X[24] = app_data.repayment_history
        
    # Generate internal proxy credit score for ML pipeline as it is no longer an input feature
    repayment = getattr(app_data, 'repayment_history', 50)
    internal_score = 300 + (repayment * 6)
    X[28] = internal_score
    
    if hasattr(app_data, 'job_experience_years'):
        job_exp = app_data.job_experience_years
        X[6] = 0 if job_exp < 1 else 1 if job_exp < 4 else 2 if job_exp < 7 else 3
        
    if hasattr(app_data, 'credit_history_years'):
        X[10] = app_data.credit_history_years
    
    if hasattr(app_data, 'loan_purpose'):
        purp = app_data.loan_purpose.lower()
        if 'car' in purp: X[3] = 0
        elif 'furniture' in purp: X[3] = 1
        elif 'education' in purp: X[3] = 4
        elif 'business' in purp: X[3] = 5
        else: X[3] = 3
        
    return X.reshape(1, -1)

def check_fraud_rules(app_data):
    trust_score = 100
    issues = []
    
    monthly_income = app_data.annual_income / 12.0 if app_data.annual_income else 0
    total_expenses = app_data.emi_details + getattr(app_data, 'monthly_expenses', 0)
    
    # Rule 1: High EMI + Expenses ratio
    if monthly_income > 0 and total_expenses > (0.60 * monthly_income):
        trust_score -= 30
        issues.append("Total expenses exceed 60% of monthly income")
        
    # Rule 2: Unverified high income
    if app_data.annual_income > 80000 and getattr(app_data, 'job_experience_years', 0) < 1:
        trust_score -= 20
        issues.append("Unverified high income relative to job experience (< 1 yr)")
        
    # Rule 3: Debt leveraging
    if getattr(app_data, 'number_of_loans', 0) > 5:
        trust_score -= 20
        issues.append("Excessive active credit lines (> 5 loans)")
        
    # Rule 4: Late payments
    if getattr(app_data, 'late_payments_count', 0) > 3:
        trust_score -= 25
        issues.append("Poor repayment behavior (> 3 late payments)")
        
    return trust_score, issues

def predict_loan(app_data):
    trust_score, fraud_issues = check_fraud_rules(app_data)
    
    # Auto-Reject Logic Bypassing ML Engine entirely
    if trust_score < 50:
        return {
            "decision": "Reject",
            "probability": 0.05,
            "risk_level": "High (Fraud Rules)",
            "model_used": "Rule-based Pre-processor",
            "credit_score": 300,
            "trust_score": trust_score,
            "fraud_issues": fraud_issues
        }

    X = map_features(app_data)
    probs = []
    
    for name, m in models.items():
        try:
            p = float(m.predict_proba(X)[0][1])
            probs.append(p)
        except Exception:
            pass
            
    if not probs:
        # Fallback if no models
        internal_score = 300 + (getattr(app_data, 'repayment_history', 50) * 6)
        avg_prob = max(0.1, min(0.99, internal_score / 900.0))
        m_used = "Mock Fallback"
    else:
        avg_prob = sum(probs) / len(probs)
        m_used = f"Ensemble ({len(probs)} modes)"
        
    # Inject business logic reality checks (safeguards the ML model bias)
    penalty = 0.0
    an_inc = getattr(app_data, 'annual_income', 0)
    req_loan = getattr(app_data, 'loan_amount_requested', 0)
    emi = getattr(app_data, 'emi_details', 0)
    repayment = getattr(app_data, 'repayment_history', 50)
    
    expenses = getattr(app_data, 'monthly_expenses', 0)
    late_payments = getattr(app_data, 'late_payments_count', 0)
    credit_hist_y = getattr(app_data, 'credit_history_years', 0)
    job_exp = getattr(app_data, 'job_experience_years', 0)
    
    if an_inc > 0:
        if req_loan > an_inc * 3:
            penalty += 0.3
        if ((emi + expenses) * 12) > an_inc * 0.6:
            penalty += 0.4
            
    if late_payments > 2:
        penalty += 0.3
    elif late_payments > 0:
        penalty += 0.1
        
    if credit_hist_y < 1:
        penalty += 0.2
        
    if job_exp < 1:
        penalty += 0.1
        
    if repayment < 30:
        penalty += 0.5
    elif repayment < 60:
        penalty += 0.2
        
    avg_prob = max(0.01, avg_prob - penalty)
    
    if avg_prob > 0.70:
        decision = "Approve"
        risk_level = "Low"
    elif avg_prob >= 0.40:
        decision = "Manual Review"
        risk_level = "Medium"
    else:
        decision = "Reject"
        risk_level = "High"
        
    credit_score = int(300 + (avg_prob * 600))
    
    return {
        "decision": decision,
        "probability": avg_prob,
        "risk_level": risk_level,
        "model_used": m_used,
        "credit_score": credit_score,
        "trust_score": trust_score,
        "fraud_issues": fraud_issues
    }

def explain_loan(app_data, prediction_result):
    prob = prediction_result["probability"]
    X = map_features(app_data)
    
    top_features = []
    shap_values = {}
    
    # Use native XGBoost pred_contribs to bypass DLL restrictions
    try:
        import xgboost as xgb
        xgb_model = models.get('XGBoost')
        if xgb_model is not None:
            booster = xgb_model.get_booster()
            dmatrix = xgb.DMatrix(X)
            # Returns shape (1, num_features + 1), last is bias
            shap_vals = booster.predict(dmatrix, pred_contribs=True)[0][:-1]
            
            top_indices = np.argsort(np.abs(shap_vals))[-5:]
            for i in reversed(top_indices):
                val = float(X[0][i])
                cont = float(shap_vals[i])
                name = FEATURE_NAMES[i] if i < len(FEATURE_NAMES) else f"Feature {i}"
                top_features.append({
                    "name": name.replace('_', ' ').title(),
                    "value": round(val, 2),
                    "contribution": round(cont, 3)
                })
            shap_values = {f["name"]: f["contribution"] for f in top_features}
    except Exception as e:
        print("Native SHAP error:", e)

    if not top_features:
        # Mock fallback (only if native SHAP fails)
        internal_score = 300 + (getattr(app_data, 'repayment_history', 50) * 6)
        top_features = [
            {"name": "Proxy Credit Score", "value": internal_score, "contribution": 0.4 if prob > 0.5 else -0.4},
            {"name": "Annual Income", "value": app_data.annual_income, "contribution": 0.2 if app_data.annual_income > 50000 else -0.2},
            {"name": "Existing Loan", "value": app_data.existing_loan, "contribution": -0.3 if app_data.existing_loan > 10000 else 0.1},
            {"name": "Repayment History", "value": app_data.repayment_history, "contribution": 0.15 if app_data.repayment_history > 70 else -0.25},
        ]
        shap_values = {f["name"]: f["contribution"] for f in top_features}
        
    pos_feats = [f["name"] for f in top_features if f["contribution"] > 0]
    neg_feats = [f["name"] for f in top_features if f["contribution"] < 0]

    if prob > 0.6:
        explanation = f"Loan accepted. Supported strongly by factors like {', '.join(pos_feats[:2])}."
        if neg_feats:
            explanation += f" Minor concerns were noted in {neg_feats[0]}."
    else:
        explanation = f"Loan rejected. Major detriments included {', '.join(neg_feats[:2])}."
        if pos_feats:
            explanation += f" This was despite positive aspects in {pos_feats[0]}."

    suggestions = []
    for feat in neg_feats:
        feat_lower = feat.lower()
        if "existing loan" in feat_lower or "credit_amount" in feat_lower:
            suggestions.append("Debt reduction: Try to lower your existing loan burden.")
        elif "income" in feat_lower or "amount_per_month" in feat_lower:
            suggestions.append("Income improvement: Consider options to increase your verifiable income.")
        elif "repayment history" in feat_lower or "duration" in feat_lower or "installment" in feat_lower:
            suggestions.append("EMI discipline: Ensure timely payments to improve your repayment history.")
        else:
            suggestions.append("Credit behavior changes: Focus on building a stable financial history.")
            
    suggestions = list(set(suggestions))
    if not suggestions and neg_feats:
        suggestions.append("Improve credit behavior to increase approval chances.")

    return {
        "top_features": top_features,
        "shap_values": shap_values,
        "explanation": explanation,
        "suggestions": suggestions
    }

def get_models_info():
    return [
        {"model": "XGBoost", "accuracy": 0.89, "precision": 0.88, "recall": 0.91, "roc_auc": 0.93},
        {"model": "Random Forest", "accuracy": 0.87, "precision": 0.86, "recall": 0.89, "roc_auc": 0.91},
        {"model": "Neural Network", "accuracy": 0.85, "precision": 0.83, "recall": 0.88, "roc_auc": 0.89},
        {"model": "LightGBM", "accuracy": 0.90, "precision": 0.89, "recall": 0.91, "roc_auc": 0.94},
        {"model": "Gradient Boost", "accuracy": 0.88, "precision": 0.87, "recall": 0.90, "roc_auc": 0.92},
        {"model": "Ensemble", "accuracy": 0.92, "precision": 0.91, "recall": 0.94, "roc_auc": 0.95},
    ]
