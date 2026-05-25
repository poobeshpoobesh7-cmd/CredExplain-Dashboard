import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Users, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);

  const fetchStats = () => {
    axios.get('http://localhost:8000/analytics').then(res => {
      setStats(res.data);
    }).catch(err => {
      console.error(err);
      if (!stats) {
        setStats({
          total_applications: 0,
          approval_rate: 0,
          avg_credit_score: 0,
          risk_distribution: { Low: 0, Medium: 0, High: 0},
          decision_distribution: { Approve: 0, "Manual Review": 0, Reject: 0 }
        });
      }
    });

    axios.get('http://localhost:8000/applications').then(res => {
      setApplications(res.data);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchStats();
    const intervalId = setInterval(fetchStats, 3000);
    return () => clearInterval(intervalId);
  }, []);

  if (!stats) return <div className="text-white">Loading...</div>;

  const pieData = stats.decision_distribution ? [
    { name: 'Approve', value: stats.decision_distribution['Approve'] || 0 },
    { name: 'Manual Review', value: stats.decision_distribution['Manual Review'] || 0 },
    { name: 'Reject', value: stats.decision_distribution['Reject'] || 0 },
  ] : [];

  const lineData = [
    { name: 'Jan', applications: 400 },
    { name: 'Feb', applications: 300 },
    { name: 'Mar', applications: 550 },
    { name: 'Apr', applications: stats.total_applications + 400 }, // simulated growth
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Overview of loan applications and model performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Applications" value={stats.total_applications} icon={<Users className="text-blue-400" />} />
        <KPICard title="Approval Rate" value={`${stats.approval_rate}%`} icon={<CheckCircle className="text-green-400" />} />
        <KPICard title="Avg Credit Score" value={stats.avg_credit_score} icon={<TrendingUp className="text-purple-400" />} />
        <KPICard title="High Risk Applications" value={stats.risk_distribution.High || 0} icon={<AlertTriangle className="text-red-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-xl font-semibold mb-6">Decision Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span className="text-sm text-slate-300">Approve</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <span className="text-sm text-slate-300">Manual Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-danger"></div>
              <span className="text-sm text-slate-300">Reject</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-xl font-semibold mb-6">Applications Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl mt-8">
        <h3 className="text-xl font-semibold mb-6 text-white">Recent Applications</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm">
                <th className="pb-3 px-4 font-medium">Applicant Name</th>
                <th className="pb-3 px-4 font-medium">Requested Amount</th>
                <th className="pb-3 px-4 font-medium">Annual Income</th>
                <th className="pb-3 px-4 font-medium">Risk Level</th>
                <th className="pb-3 px-4 font-medium">Decision</th>
                <th className="pb-3 px-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-4 text-white font-medium group-hover:text-primary transition-colors">{app.name}</td>
                  <td className="py-4 px-4 text-slate-300">${app.loan_amount_requested.toLocaleString()}</td>
                  <td className="py-4 px-4 text-slate-300">${app.annual_income.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      app.risk_level === 'Low' ? 'bg-success/20 text-success' :
                      app.risk_level === 'High' ? 'bg-danger/20 text-danger' :
                      'bg-warning/20 text-warning'
                    }`}>
                      {app.risk_level || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`font-semibold ${
                      app.decision === 'Approve' ? 'text-success' :
                      app.decision === 'Reject' ? 'text-danger' :
                      app.decision === 'Manual Review' ? 'text-warning' : 'text-slate-400'
                    }`}>
                      {app.decision || 'Pending'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-400 text-sm">
                    {new Date(app.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 italic">No applications found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon }) => (
  <div className="glass-panel p-6 rounded-2xl flex items-center justify-between group hover:bg-surface/80 transition-all duration-300">
    <div>
      <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-white group-hover:text-primary transition-colors">{value}</h3>
    </div>
    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
      {icon}
    </div>
  </div>
);

export default Dashboard;
