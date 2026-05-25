import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import axios from 'axios';

const Explainability = ({ inlineFormData, inlineResult }) => {
  const location = useLocation();
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const getStoredData = (key) => {
    try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; }
  };
  
  const formData = inlineFormData || location.state?.formData || getStoredData('lastFormData');
  const result = inlineResult || location.state?.result || getStoredData('lastResult');
  const isInline = !!inlineFormData;

  useEffect(() => {
    if (formData && !explanation) {
      setLoading(true);
      axios.post('http://localhost:8000/explain', formData)
        .then(res => setExplanation(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [formData, explanation]);

  if (!formData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
        <BrainCircuit size={48} className="opacity-50" />
        <p>No prediction data found to explain.</p>
        <Link to="/predict" className="btn-primary">Go to Loan Prediction</Link>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface/95 border border-white/10 p-4 rounded-xl shadow-xl backdrop-blur-md">
          <p className="font-semibold text-white mb-1">{data.name}</p>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-slate-400">Impact:</span>
            <span className={data.contribution > 0 ? "text-success" : "text-danger"}>
              {data.contribution > 0 ? '+' : ''}{data.contribution.toFixed(3)}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-sm mt-1">
            <span className="text-slate-400">Value:</span>
            <span className="text-white">{data.value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        {!isInline && (
          <Link to="/predict" className="w-10 h-10 rounded-full bg-surface hover:bg-white/10 flex items-center justify-center transition-colors">
            <ArrowLeft size={20} />
          </Link>
        )}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Explainability (XAI)</h1>
          <p className="text-slate-400">Understanding the "Why" behind the AI's decision.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 glass-panel p-6 rounded-2xl h-fit border-l-4 border-primary">
          <h3 className="text-sm font-semibold text-primary tracking-widest uppercase mb-4">Applicant Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Name</span>
              <span className="font-medium">{formData.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Decision</span>
              <span className={`font-bold ${
                result?.decision === 'Approve' ? 'text-success' : 
                result?.decision === 'Reject' ? 'text-danger' : 'text-warning'
              }`}>{result?.decision}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Confidence</span>
              <span className="font-medium">{(result?.probability * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-primary tracking-widest uppercase mb-4">AI Explanation</h3>
            {loading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-2 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-2 bg-slate-700 rounded"></div>
                  <div className="h-2 bg-slate-700 rounded w-5/6"></div>
                </div>
              </div>
            ) : (
              <p className="text-slate-300 leading-relaxed text-sm p-4 bg-slate-800/50 rounded-xl italic border border-white/5 shadow-inner">
                "{explanation?.explanation}"
              </p>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-primary tracking-widest uppercase mb-4">Actionable Suggestions</h3>
            {loading ? (
              <div className="animate-pulse flex flex-col gap-3">
                <div className="h-12 bg-slate-700/50 rounded-xl w-full"></div>
                <div className="h-12 bg-slate-700/50 rounded-xl w-full"></div>
              </div>
            ) : explanation?.suggestions && explanation.suggestions.length > 0 ? (
              <div className="space-y-3">
                {explanation.suggestions.map((suggestion, idx) => {
                  const parts = suggestion.split(': ');
                  const title = parts[0];
                  const desc = parts.length > 1 ? parts[1] : '';
                  return (
                    <div key={idx} className="bg-surface/50 border border-white/5 p-3 rounded-xl hover:border-primary/30 transition-colors">
                      <p className="font-semibold text-sm text-white mb-1">{title}</p>
                      {desc && <p className="text-xs text-slate-400">{desc}</p>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No specific suggestions available.</p>
            )}
          </div>
        </div>

        <div className="md:col-span-2 glass-panel p-6 rounded-2xl">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BrainCircuit className="text-primary" />
            Feature Impact Analysis (SHAP Value equivalents)
          </h3>
          
          <div className="h-[400px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-slate-500">Loading charts...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={explanation?.top_features || []}
                  margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorPos" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={1}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="colorNeg" x1="1" y1="0" x2="0" y2="0">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={1}/>
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0.8}/>
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.5} />
                  <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" stroke="#e2e8f0" width={110} tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 500 }} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={2} opacity={0.8} />
                  <Bar dataKey="contribution" radius={[0, 6, 6, 0]} isAnimationActive={true} animationDuration={1500} animationEasing="ease-out">
                    {explanation?.top_features.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.contribution > 0 ? 'url(#colorPos)' : 'url(#colorNeg)'} 
                        filter="url(#glow)"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="flex justify-center gap-8 mt-6 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-success"></div>
              <span className="text-sm text-slate-300">Pushes towards Accept (+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-danger"></div>
              <span className="text-sm text-slate-300">Pushes towards Reject (-)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explainability;
