import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileSpreadsheet, BarChart3, Network, Settings } from 'lucide-react';

// Placeholder Pages
import Dashboard from './pages/Dashboard';

const CursorGlow = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden mix-blend-screen"
      style={{ isolation: 'isolate' }}
    >
      <div 
        className="absolute w-[400px] h-[400px] rounded-full bg-cyan-400/20 blur-[80px] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out will-change-transform"
        style={{ 
          transform: `translate(calc(${position.x}px - 50%), calc(${position.y}px - 50%))` 
        }}
      />
      <div 
        className="absolute w-[100px] h-[100px] rounded-full bg-white/40 blur-[20px] -translate-x-1/2 -translate-y-1/2 transition-transform duration-0 ease-out will-change-transform"
        style={{ 
          transform: `translate(calc(${position.x}px - 50%), calc(${position.y}px - 50%))` 
        }}
      />
    </div>
  );
};
import LoanPrediction from './pages/LoanPrediction';
import Explainability from './pages/Explainability';
import ModelInsights from './pages/ModelInsights';
import AdminPanel from './pages/AdminPanel';

const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Loan Prediction', path: '/predict', icon: <FileSpreadsheet size={20} /> },
    { name: 'Explainability', path: '/explain', icon: <BarChart3 size={20} /> },
    { name: 'Model Insights', path: '/insights', icon: <Network size={20} /> },
    { name: 'Admin Panel', path: '/admin', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 h-screen glass-panel fixed left-0 top-0 flex flex-col p-6 z-10">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-300 flex items-center justify-center shadow-lg shadow-primary/30">
          <span className="font-bold text-xl text-white">C</span>
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight">Cred<span className="text-primary font-normal">Explain</span></h1>
          <p className="text-xs text-slate-400">AI Loan Approvals</p>
        </div>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/20 text-primary font-medium border border-primary/20 backdrop-blur-md' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`${isActive ? 'text-primary' : 'text-slate-400'}`}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 px-4">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="text-sm font-medium">U</span>
          </div>
          <div>
            <p className="text-sm font-medium">Officer User</p>
            <p className="text-xs text-slate-400">Reviewing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex bg-[#0B1120] relative overflow-hidden">
        <CursorGlow />
        {/* Background Decorative Elements for Liquid Crystal effect */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/60 rounded-full blur-[100px] pointer-events-none animate-[pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-600/50 rounded-full blur-[120px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/40 rounded-full blur-[140px] pointer-events-none animate-[pulse_10s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-pink-500/50 rounded-full blur-[100px] pointer-events-none animate-[pulse_7s_ease-in-out_infinite]" style={{ animationDelay: '3s' }}></div>
        
        <Sidebar />
        
        <main className="flex-1 ml-64 p-8 relative z-0 min-h-screen overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predict" element={<LoanPrediction />} />
            <Route path="/explain" element={<Explainability />} />
            <Route path="/insights" element={<ModelInsights />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
