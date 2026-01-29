import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { AlertOctagon, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const SupervisorDashboard = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, byDept: {} });
    const [oldIssues, setOldIssues] = useState([]);

    useEffect(() => {
        // Load stats
        const data = db.getStats();

        // Calculate Pseudo-Satisfaction Score based on Resolution Rate
        // Logic: Base 50% + (Resolved/Total * 50%)
        // If 0 issues, default to 100% (Optimism)
        const satisfaction = data.total === 0 ? 100 : Math.round(50 + ((data.resolved / data.total) * 50));

        setStats({ ...data, satisfaction });

        // Find "Old" issues (simulating SLA breach > 2 days for demo)
        const issues = db.getAllIssues();
        const twoDaysAgo = new Date(Date.now() - 172800000); // 48 hrs
        const breach = issues.filter(i =>
            new Date(i.createdAt) < twoDaysAgo &&
            ['reported', 'assigned', 'in_progress'].includes(i.status)
        );
        setOldIssues(breach);
    }, []);

    // Helper for Priority Colors
    const getPriorityStyles = (p) => {
        switch (p) {
            case 'Critical': return { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-800' };
            case 'High': return { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800' };
            case 'Medium': return { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' };
            default: return { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' };
        }
    };

    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">City Operations Overview</h1>
                <p className="page-subtitle">Monitoring performance and Service Level Agreements.</p>
            </header>

            {/* Metrics Grid */}
            <div className="stats-grid">
                <div className="stat-card border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="stat-value">{stats.pending}</div>
                            <div className="stat-label">Pending Issues</div>
                        </div>
                        <AlertOctagon className="text-blue-500" size={24} />
                    </div>
                </div>
                <div className="stat-card border-l-4 border-l-green-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="stat-value">{stats.resolved}</div>
                            <div className="stat-label">Resolved (All Time)</div>
                        </div>
                        <CheckCircle2 className="text-green-500" size={24} />
                    </div>
                </div>
                <div className="stat-card border-l-4 border-l-red-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="stat-value">{oldIssues.length}</div>
                            <div className="stat-label">SLA Breaches (&gt;48h)</div>
                        </div>
                        <TrendingUp className="text-red-500" size={24} />
                    </div>
                </div>
                <div className="stat-card border-l-4 border-l-purple-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="stat-value">{stats.satisfaction || 0}%</div>
                            <div className="stat-label">Citizen Satisfaction</div>
                        </div>
                        <Users className="text-purple-500" size={24} />
                    </div>
                </div>

                <Link to="/supervisor/map" className="stat-card border-l-4 border-l-indigo-600 hover:shadow-lg transition-transform transform hover:-translate-y-1 group">
                    <div className="flex justify-between items-center h-full">
                        <div>
                            <div className="text-xl font-bold text-indigo-900 group-hover:text-indigo-700">Live Heatmap</div>
                            <div className="stat-label mt-1">View Real-time</div>
                        </div>
                        <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Escalation Watchlist */}
            <div className="bg-white rounded-lg shadow-md border border-[var(--color-border)] overflow-hidden">
                <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <AlertOctagon size={20} className="text-red-500" />
                        Escalation Watchlist
                    </h2>
                    <span className="text-sm text-red-600 font-medium">{oldIssues.length} Issues Requiring Attention</span>
                </div>

                <div className="divide-y divide-gray-100">
                    {oldIssues.length === 0 && (
                        <div className="p-8 text-center text-muted">No operational bottlenecks detected. Good job!</div>
                    )}

                    {oldIssues.map(issue => {
                        const styles = getPriorityStyles(issue.priority);
                        return (
                            <div key={issue.id} className={`p-4 hover:bg-gray-50 transition-colors flex justify-between items-center border-l-4 ${styles.border}`}>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${styles.badge}`}>{issue.priority}</span>
                                        <span className="font-mono text-xs text-muted">#{issue.id}</span>
                                    </div>
                                    <div className="font-semibold text-gray-900 text-base">{issue.type}</div>
                                    <div className="text-sm text-muted">
                                        {issue.department} • {issue.location} • <span className="text-red-600 font-medium">{Math.floor((Date.now() - new Date(issue.createdAt)) / 3600000)} hours old</span>
                                    </div>
                                </div>
                                <Link to={`/staff/task/${issue.id}`} className="btn btn-secondary text-xs">
                                    Review
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
            <br />

            {/* Department Breakdown */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow border border-[var(--color-border)]">
                    <h3 className="font-bold mb-4">Department Load</h3>
                    <div className="space-y-3">
                        {Object.entries(stats.byDept).map(([dept, count]) => (
                            <div key={dept}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{dept}</span>
                                    <span className="font-medium">{count} issues</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${(count / stats.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SupervisorDashboard;
