import React, { useMemo } from 'react';
import { db } from '../../services/db';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

const Reports = () => {
    const issues = db.getAllIssues();

    // Calculate aggregated stats
    const stats = useMemo(() => {
        const total = issues.length;
        const resolved = issues.filter(i => ['resolved', 'closed'].includes(i.status)).length;
        const pending = total - resolved;
        const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;

        const byType = issues.reduce((acc, curr) => {
            acc[curr.type] = (acc[curr.type] || 0) + 1;
            return acc;
        }, {});

        const byDept = issues.reduce((acc, curr) => {
            acc[curr.department] = (acc[curr.department] || 0) + 1;
            return acc;
        }, {});

        // Calculate Avg Response Time (Created -> Updated/Resolved)
        // For simplicity, we use (updatedAt - createdAt) for resolved/closed issues
        const resolvedIssues = issues.filter(i => ['resolved', 'closed'].includes(i.status));
        let totalTimeMs = 0;
        resolvedIssues.forEach(i => {
            const start = new Date(i.createdAt).getTime();
            const end = new Date(i.updatedAt).getTime();
            totalTimeMs += (end - start);
        });
        const avgTimeHours = resolvedIssues.length
            ? Math.round((totalTimeMs / resolvedIssues.length) / 3600000 * 10) / 10
            : 0;

        return { total, resolved, pending, resolutionRate, byType, byDept, avgTimeHours };
    }, [issues]);

    return (
        <div>
            <header className="page-header flex justify-between items-end">
                <div>
                    <h1 className="page-title">Operational Reports</h1>
                    <p className="page-subtitle">System-wide performance analytics and category breakdown.</p>
                </div>
                <button className="btn btn-primary" onClick={() => window.print()}>
                    Export / Print
                </button>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-800 text-white p-6 rounded-lg shadow-lg">
                    <div className="text-slate-400 text-sm font-medium mb-1">Resolution Rate</div>
                    <div className="text-3xl font-bold">{stats.resolutionRate}%</div>
                    <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                        <TrendingUp size={14} /> +2.4% vs last week
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--color-border)]">
                    <div className="text-muted text-sm font-medium mb-1">Total Issues</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--color-border)]">
                    <div className="text-muted text-sm font-medium mb-1">Avg Response Time</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.avgTimeHours}h</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--color-border)]">
                    <div className="text-muted text-sm font-medium mb-1">Active Staff</div>
                    <div className="text-3xl font-bold text-gray-900">12</div>
                </div>
            </div>
            <br />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Breakdown Table */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 mb-6">
                        <PieChart className="text-blue-600" />
                        <h3 className="font-bold text-lg">Issues by Category</h3>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(stats.byType).map(([type, count]) => (
                            <div key={type}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">{type}</span>
                                    <span className="text-gray-500">{count} ({Math.round(count / stats.total * 100)}%)</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-500 h-2.5 rounded-full"
                                        style={{ width: `${(count / stats.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <br />
                {/* Department Efficiency Table */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="text-purple-600" />
                        <h3 className="font-bold text-lg">Department Load</h3>
                    </div>

                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Department</th>
                                <th className="px-4 py-3">Issues</th>
                                <th className="px-4 py-3 rounded-r-lg text-right">Load</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(stats.byDept).map(([dept, count]) => (
                                <tr key={dept} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{dept}</td>
                                    <td className="px-4 py-3">{count}</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${count > 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {count > 5 ? 'HEAVY' : 'NORMAL'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
