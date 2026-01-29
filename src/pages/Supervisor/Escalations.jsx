import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';

const Escalations = () => {
    const [escalations, setEscalations] = useState([]);

    useEffect(() => {
        const issues = db.getAllIssues();
        const now = Date.now();
        // Define SLA breach as > 24 hours for demo purposes (real world might be different)
        const slaThresholdInfo = 24 * 60 * 60 * 1000;

        const breaches = issues.filter(i => {
            const isPending = ['reported', 'assigned', 'in_progress'].includes(i.status);
            const age = now - new Date(i.createdAt).getTime();
            return isPending && age > slaThresholdInfo;
        });

        setEscalations(breaches);
    }, []);

    // Priority Helper
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
            <header className="page-header border-b border-red-100 pb-6 mb-6">
                <div className="flex items-center gap-3 text-red-600 mb-2">
                    <AlertTriangle size={32} />
                    <h1 className="page-title text-red-700 m-0">Escalations</h1>
                </div>
                <p className="page-subtitle text-red-600/80">
                    Issues exceeding 24h SLA response time. Immediate action required.
                </p>
            </header>

            <div className="grid gap-4">
                {escalations.length === 0 && (
                    <div className="p-12 text-center bg-green-50 rounded-lg border border-green-100 text-green-800">
                        <div className="text-xl font-bold mb-4 px-2 py-2">System Healthy</div>
                        <p>No SLA breaches detected. All systems operating within normal parameters.</p>
                    </div>
                )}

                {escalations.map(issue => {
                    const hoursOld = Math.floor((Date.now() - new Date(issue.createdAt)) / 3600000);
                    const styles = getPriorityStyles(issue.priority);

                    return (
                        <div key={issue.id} className={`bg-white border-l-4 ${styles.border} rounded-r-lg shadow-sm border-y border-r p-6 flex justify-between items-center group`}>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${styles.badge}`}>
                                        {issue.priority}
                                    </span>
                                    <span className="font-mono text-gray-400">#{issue.id}</span>
                                    <span className="text-red-600 text-xs font-bold px-2 py-1 bg-red-50 rounded border border-red-100">
                                        OVERDUE BY {hoursOld - 24}H
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{issue.type}</h3>
                                <p className="text-gray-600 mb-3">{issue.description}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><Clock size={16} /> Reported: {new Date(issue.createdAt).toLocaleString()}</span>
                                    <span>•</span>
                                    <span>{issue.department}</span>
                                    <span>•</span>
                                    <span>{issue.location}</span>
                                </div>
                            </div>

                            <Link to={`/staff/task/${issue.id}`} className="btn btn-secondary text-red-600 border-red-200 hover:bg-red-50 group-hover:translate-x-1 transition-all">
                                Review Case <ArrowRight size={16} />
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Escalations;
