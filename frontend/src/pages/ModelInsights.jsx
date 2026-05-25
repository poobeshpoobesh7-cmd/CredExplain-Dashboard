import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, CheckSquare, Zap, Activity } from 'lucide-react';

const ModelInsights = () => {
  const [models, setModels] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/models')
      .then(res => setModels(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Model Insights</h1>
        <p className="text-slate-400">Comparing ML models performance against the validation dataset.</p>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/80 text-primary uppercase text-xs tracking-wider border-b border-white/10">
                <th className="p-6 font-medium">Model Approach</th>
                <th className="p-6 font-medium text-center">Accuracy</th>
                <th className="p-6 font-medium text-center">Precision</th>
                <th className="p-6 font-medium text-center">Recall</th>
                <th className="p-6 font-medium text-center">ROC-AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {models.map((model, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6 border-l-2 border-transparent group-hover:border-primary transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Activity size={16} />
                      </div>
                      <span className="font-semibold text-white">{model.model}</span>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <MetricBadge value={model.accuracy} icon={<Target size={14} />} />
                  </td>
                  <td className="p-6 text-center">
                    <MetricBadge value={model.precision} icon={<CheckSquare size={14} />} />
                  </td>
                  <td className="p-6 text-center">
                    <MetricBadge value={model.recall} icon={<Zap size={14} />} />
                  </td>
                  <td className="p-6 text-center">
                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {model.roc_auc.toFixed(3)}
                    </div>
                  </td>
                </tr>
              ))}
              {models.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500">Loading model telemetry...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MetricBadge = ({ value, icon }) => (
  <div className="inline-flex items-center gap-1.5 justify-center px-3 py-1 rounded-full text-sm font-medium bg-slate-800 text-slate-300">
    {icon}
    {(value * 100).toFixed(1)}%
  </div>
);

export default ModelInsights;
