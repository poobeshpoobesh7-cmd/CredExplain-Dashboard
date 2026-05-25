import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, Activity, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Explainability from './Explainability';

const LoanPrediction = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: 30,
    employment_type: 'salaried',
    annual_income: 60000,
    existing_loan: 5000,
    marital_status: 'single',
    emi_details: 1000,
    repayment_history: 80,
    loan_amount_requested: 20000,
    credit_history_years: 5,
    number_of_loans: 1,
    monthly_expenses: 2000,
    late_payments_count: 0,
    job_experience_years: 3,
    loan_purpose: 'personal'
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ["age", "annual_income", "existing_loan", "emi_details", "repayment_history", "loan_amount_requested", "credit_history_years", "number_of_loans", "monthly_expenses", "late_payments_count", "job_experience_years"].includes(name) 
        ? (value === '' ? '' : Number(value)) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/predict', formData);
      setResult(response.data);
      sessionStorage.setItem('lastFormData', JSON.stringify(formData));
      sessionStorage.setItem('lastResult', JSON.stringify(response.data));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const seeExplanation = () => {
    // In a real app we'd pass the specific ID
    navigate('/explain', { state: { formData, result } });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Loan Prediction</h1>
        <p className="text-slate-400">Enter applicant details to get an AI-powered decision.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label-text">Full Name</label>
                <input type="text" name="name" className="input-field" required value={formData.name} onChange={handleChange} placeholder="John Doe" />
              </div>
              <div>
                <label className="label-text">Age</label>
                <input type="number" name="age" className="input-field" required value={formData.age} onChange={handleChange} min="18" max="100" />
              </div>
              
              <div>
                <label className="label-text">Employment Type</label>
                <select name="employment_type" className="input-field" value={formData.employment_type} onChange={handleChange}>
                  <option value="salaried">Salaried</option>
                  <option value="self-employed">Self Employed</option>
                  <option value="unemployed">Unemployed</option>
                </select>
              </div>
              <div>
                <label className="label-text">Marital Status</label>
                <select name="marital_status" className="input-field" value={formData.marital_status} onChange={handleChange}>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                </select>
              </div>

              <div>
                <label className="label-text">Annual Income ($)</label>
                <input type="number" name="annual_income" className="input-field" required value={formData.annual_income} onChange={handleChange} />
              </div>
              <div>
                <label className="label-text">Existing Loan Amount ($)</label>
                <input type="number" name="existing_loan" className="input-field" required value={formData.existing_loan} onChange={handleChange} />
              </div>

              <div>
                <label className="label-text">EMI Details ($/month)</label>
                <input type="number" name="emi_details" className="input-field" required value={formData.emi_details} onChange={handleChange} />
              </div>
              <div>
                <label className="label-text">Loan Amount Requested ($)</label>
                <input type="number" name="loan_amount_requested" className="input-field" required value={formData.loan_amount_requested} onChange={handleChange} />
              </div>

              <div>
                <label className="label-text">Credit History (Years)</label>
                <input type="number" name="credit_history_years" className="input-field" required value={formData.credit_history_years} onChange={handleChange} min="0" step="0.5" />
              </div>
              <div>
                <label className="label-text">Number of Existing Loans</label>
                <input type="number" name="number_of_loans" className="input-field" required value={formData.number_of_loans} onChange={handleChange} min="0" />
              </div>
              
              <div>
                <label className="label-text">Monthly Expenses ($)</label>
                <input type="number" name="monthly_expenses" className="input-field" required value={formData.monthly_expenses} onChange={handleChange} min="0" />
              </div>
              <div>
                <label className="label-text">Late Payments Count</label>
                <input type="number" name="late_payments_count" className="input-field" required value={formData.late_payments_count} onChange={handleChange} min="0" />
              </div>

              <div>
                <label className="label-text">Job Experience (Years)</label>
                <input type="number" name="job_experience_years" className="input-field" required value={formData.job_experience_years} onChange={handleChange} min="0" step="0.5" />
              </div>
              <div>
                <label className="label-text">Loan Purpose</label>
                <select name="loan_purpose" className="input-field" value={formData.loan_purpose} onChange={handleChange}>
                  <option value="personal">Personal</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="car">Car / Vehicle</option>
                  <option value="furniture">Home / Furniture</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="label-text flex justify-between">
                  <span>Repayment History Score</span>
                  <span className="text-primary">{formData.repayment_history}</span>
                </label>
                <input type="range" name="repayment_history" className="w-full accent-primary" min="0" max="100" value={formData.repayment_history} onChange={handleChange} />
                <div className="flex justify-between text-xs text-slate-500 mt-1"><span>0</span><span>100</span></div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-slate-400 opacity-80 max-w-md text-left">
                <strong>Disclaimer:</strong> This application provides loan eligibility predictions based on user-provided information. It does not access or verify data from Aadhaar, PAN, or any financial institutions. The results are for informational purposes only and not an official credit decision.
              </p>
              <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 flex-shrink-0">
                {loading ? <Activity className="animate-spin" /> : 'Predict Loan Decision'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          {result ? (
            <div className={`glass-panel p-8 rounded-3xl border-2 transition-all ${
              result.decision === 'Approve' ? 'border-success/50 shadow-[0_0_30px_rgba(34,197,94,0.15)]' : 
              result.decision === 'Reject' ? 'border-danger/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]' :
              'border-warning/50 shadow-[0_0_30px_rgba(234,179,8,0.15)]'
            }`}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  result.decision === 'Approve' ? 'bg-success/20 text-success' : 
                  result.decision === 'Reject' ? 'bg-danger/20 text-danger' :
                  'bg-warning/20 text-warning'
                }`}>
                  {result.decision === 'Approve' ? <ShieldCheck size={40} /> : <ShieldAlert size={40} />}
                </div>
                
                <h2 className="text-2xl font-bold">
                  {result.decision === 'Approve' ? 'APPROVED' : 
                   result.decision === 'Reject' ? 'REJECTED' : 'MANUAL REVIEW'}
                </h2>
                
                <div className="w-full space-y-2 mt-4 text-left">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Approval Probability</span>
                    <span className="font-semibold text-white">{(result.probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className={`h-2 rounded-full ${
                      result.decision === 'Approve' ? 'bg-success' : 
                      result.decision === 'Reject' ? 'bg-danger' : 'bg-warning'
                    }`} style={{ width: `${result.probability * 100}%` }}></div>
                  </div>
                </div>

                <div className="w-full flex justify-between items-center py-4 border-b border-t border-white/10 mt-4">
                  <span className="text-slate-400 text-sm">Risk Level</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    result.risk_level === 'Low' ? 'bg-success/20 text-success' :
                    result.risk_level === 'Medium' ? 'bg-warning/20 text-warning' :
                    'bg-danger/20 text-danger'
                  }`}>{result.risk_level}</span>
                </div>
                
                <div className="w-full flex justify-between items-center pb-2">
                  <span className="text-slate-400 text-sm">Generated Credit Score</span>
                  <span className="font-bold text-primary text-lg">{result.credit_score}</span>
                </div>

                {result.trust_score !== undefined && result.trust_score !== null && (
                  <div className="w-full border-t border-white/10 pt-4 mt-2">
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-slate-400 text-sm font-medium">Fraud Rules Trust Score</span>
                      <span className={`font-bold text-lg ${result.trust_score < 50 ? 'text-danger' : 'text-success'}`}>
                        {result.trust_score} / 100
                      </span>
                    </div>
                    {result.fraud_issues && result.fraud_issues.length > 0 && (
                      <div className="bg-danger/10 border border-danger/30 rounded-lg p-3 mt-2 text-left">
                        <h4 className="text-danger text-xs font-bold uppercase mb-2 flex items-center gap-1"><ShieldAlert size={14} /> Auto-Reject Triggers</h4>
                        <ul className="list-disc pl-5 text-sm text-red-200/90 space-y-1">
                          {result.fraud_issues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Explainability component is now rendered dynamically below instead of navigating */}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-3xl h-full flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-white/20">
              <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center text-slate-500">
                <Activity size={32} />
              </div>
              <h3 className="text-xl font-semibold text-slate-300">Ready for Prediction</h3>
              <p className="text-sm text-slate-500">Submit the form to see the AI's decision and risk analysis.</p>
            </div>
          )}
        </div>
      </div>
      
      {result && (
        <div className="mt-12 animate-fade-in">
          <Explainability inlineFormData={formData} inlineResult={result} />
        </div>
      )}
    </div>
  );
};

export default LoanPrediction;
