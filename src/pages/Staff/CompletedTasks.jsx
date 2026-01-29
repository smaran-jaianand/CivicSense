import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Link } from 'react-router-dom';
import { CheckCircle2, Calendar } from 'lucide-react';

const CompletedTasks = () => {
    const [completedTasks, setCompletedTasks] = useState([]);

    useEffect(() => {
        const issues = db.getAllIssues();
        const resolved = issues.filter(i => ['resolved', 'closed'].includes(i.status));
        setCompletedTasks(resolved);
    }, []);

    return (
        <div>
            <header className="page-header">
                <h1 className="page-title">Completed History</h1>
                <p className="page-subtitle">Archive of resolved incidents and maintenance work.</p>
            </header>

            <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-[var(--color-border)] text-xs uppercase text-muted">
                            <th className="p-4 font-semibold">ID</th>
                            <th className="p-4 font-semibold">Issue</th>
                            <th className="p-4 font-semibold">Location</th>
                            <th className="p-4 font-semibold">Resolved Date</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {completedTasks.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-muted">
                                    No completed tasks found.
                                </td>
                            </tr>
                        )}
                        {completedTasks.map(task => (
                            <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-mono text-sm text-gray-500">{task.id}</td>
                                <td className="p-4 font-medium">{task.type}</td>
                                <td className="p-4 text-sm text-gray-600">{task.location}</td>
                                <td className="p-4 text-sm text-gray-600">
                                    {new Date(task.updatedAt).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    <span className="badge bg-green-100 text-green-700 border border-green-200">
                                        {task.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <Link to={`/staff/task/${task.id}`} className="text-primary hover:underline text-sm font-medium">
                                        View Log
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CompletedTasks;
