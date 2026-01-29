import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import CitizenLayout from '../../layouts/CitizenLayout';
import { PlusCircle, List, AlertCircle } from 'lucide-react';
import { db } from '../../services/db';

// Sub-components
import ReportIssue from './ReportIssue';
import MyReports from './MyReports';

// Dashboard View
const Dashboard = () => {
    const issues = db.getAllIssues();
    // Mocking "My Issues" as all issues for demo, or we could filter if we had auth
    const myIssues = issues.filter(i => i.history[0].by === 'Citizen');
    const activeIssues = myIssues.filter(i => i.status !== 'resolved' && i.status !== 'closed');

    const impactScore = myIssues.length > 5 ? 'High' : (myIssues.length > 2 ? 'Medium' : 'Low');

    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">Citizen Dashboard</h1>
                <p className="page-subtitle">Welcome back. Together we make our city better.</p>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{activeIssues.length}</div>
                    <div className="stat-label">Active Reports</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{myIssues.length}</div>
                    <div className="stat-label">Total Contributions</div>
                </div>
                <div className="stat-card" style={{ borderColor: 'var(--color-primary-light)' }}>
                    <div className="stat-value text-primary">{impactScore}</div>
                    <div className="stat-label">Impact Score</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Quick Report Card */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 mb-4 text-xl">
                        <PlusCircle className="text-primary" />
                        <h2>New Issue?</h2>
                    </div>
                    <p className="text-muted mb-6">Found uncollected garbage, a pothole, or a broken streetlight? Report it now.</p>
                    <br />
                    <Link to="report" className="btn btn-primary w-full shadow-lg">
                        Report an Issue
                    </Link>
                </div>

                {/* Recent Activity Card */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 mb-4 text-xl">
                        <List className="text-secondary" />
                        <h2>Recent Updates</h2>
                    </div>
                    <div className="flex flex-col gap-4">
                        {myIssues.slice(0, 3).map(issue => (
                            <div key={issue.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                                <div>
                                    <div className="font-semibold text-sm">{issue.type}</div>
                                    <div className="text-xs text-muted">{new Date(issue.updatedAt).toLocaleDateString()}</div>
                                </div>
                                <span className={`badge`} style={{
                                    backgroundColor: `var(--status-${issue.status.replace('_', '-')})`, // simplified mapping
                                    color: 'white'
                                }}>
                                    {issue.status.replace('_', ' ')}
                                </span>
                            </div>
                        ))}
                        {myIssues.length === 0 && <p className="text-muted text-sm">No recent activity.</p>}
                    </div>
                    <Link to="history" className="btn btn-ghost text-sm w-full mt-4">View Full History</Link>
                </div>
            </div>
        </div>
    );
};

// Main Entry Component for Citizen Section
export default function CitizenHome() {
    return (
        <Routes>
            <Route element={<CitizenLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="report" element={<ReportIssue />} />
                <Route path="history" element={<MyReports />} />
            </Route>
        </Routes>
    );
}
