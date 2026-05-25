import React, { useState } from 'react';
import { Settings, UploadCloud, Save, HardDrive } from 'lucide-react';

const AdminPanel = () => {
  const [threshold, setThreshold] = useState(0.5);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-slate-400">Manage machine learning models and system configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-3xl space-y-6 flex flex-col">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Settings className="text-primary" />
            <h3 className="text-xl font-semibold">Decision Threshold</h3>
          </div>
          
          <p className="text-sm text-slate-400">
            Adjust the confidence threshold required to <span className="text-success font-bold">Accept</span> a loan application. A higher threshold means fewer approvals but lower risk.
          </p>

          <div className="pt-4 flex-1">
            <div className="flex justify-between font-mono text-sm mb-2">
              <span className="text-danger">Current: {threshold.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              className="w-full accent-primary h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" 
              min="0.1" max="0.9" step="0.05" 
              value={threshold} 
              onChange={(e) => setThreshold(parseFloat(e.target.value))} 
            />
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>Risk-Tolerant (0.1)</span>
              <span>Strict (0.9)</span>
            </div>
          </div>

          <button className="btn-primary flex items-center justify-center gap-2 mt-auto">
            <Save size={18} /> Save Configuration
          </button>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <HardDrive className="text-primary" />
            <h3 className="text-xl font-semibold">Model Management</h3>
          </div>

          <p className="text-sm text-slate-400">
            Upload new .pkl files to override the current ensemble models. Support: XGBoost, Random Forest, Neural Networks.
          </p>

          <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center hover:bg-slate-800/30 hover:border-primary transition-colors cursor-pointer group">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud size={32} className="text-primary" />
            </div>
            <p className="font-semibold text-white mb-1">Click to upload or drag & drop</p>
            <p className="text-xs text-slate-500">Only .pkl files are supported (max 50MB)</p>
          </div>
        </div>
      </div>
      
      <div className="glass-panel p-6 rounded-3xl mt-8">
        <h3 className="text-xl font-semibold mb-6">Recent Prediction Logs</h3>
        <div className="text-slate-500 text-sm text-center py-12 border border-dashed border-white/10 rounded-xl">
          Logs are securely retrieved. You will see production queries here.
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
