from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)

class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    age = Column(Integer)
    employment_type = Column(String)
    annual_income = Column(Float)
    existing_loan = Column(Float)
    marital_status = Column(String)
    emi_details = Column(Float)
    repayment_history = Column(Integer)
    loan_amount_requested = Column(Float)
    credit_history_years = Column(Float)
    number_of_loans = Column(Integer)
    monthly_expenses = Column(Float)
    late_payments_count = Column(Integer)
    job_experience_years = Column(Float)
    loan_purpose = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    predictions = relationship("Prediction", back_populates="application")

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"))
    decision = Column(String)
    probability = Column(Float)
    risk_level = Column(String)
    model_used = Column(String)
    
    application = relationship("Application", back_populates="predictions")
    explanation = relationship("Explanation", back_populates="prediction", uselist=False)

class Explanation(Base):
    __tablename__ = "explanations"
    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"))
    shap_data = Column(Text) # JSON string of shap values
    explanation_text = Column(String)
    
    prediction = relationship("Prediction", back_populates="explanation")
