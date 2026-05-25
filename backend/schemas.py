from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ApplicationCreate(BaseModel):
    name: str
    age: int
    employment_type: str
    annual_income: float
    existing_loan: float
    marital_status: str
    emi_details: float
    repayment_history: int
    loan_amount_requested: float
    credit_history_years: float
    number_of_loans: int
    monthly_expenses: float
    late_payments_count: int
    job_experience_years: float
    loan_purpose: str

class PredictionResponse(BaseModel):
    decision: str
    probability: float
    risk_level: str
    credit_score: int
    trust_score: Optional[int] = None
    fraud_issues: Optional[List[str]] = None

class ExplainResponse(BaseModel):
    top_features: list
    shap_values: dict
    explanation: str
    suggestions: list

class ApplicationResponse(ApplicationCreate):
    id: int
    class Config:
        from_attributes = True

class ApplicationSummary(BaseModel):
    id: int
    name: str
    annual_income: float
    loan_amount_requested: float
    decision: Optional[str] = None
    risk_level: Optional[str] = None
    timestamp: datetime
    
    class Config:
        from_attributes = True
