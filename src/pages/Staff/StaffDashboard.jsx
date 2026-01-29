import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/db';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

const StaffDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [deptFilter, setDeptFilter] = useState('Public Works'); // Default view

    useEffect(() => {
        // Poll for updates or just load once
        setTasks(db.getAllIssues());
    }, []);

    // Filter logic: 
    // 1. Must match department
    // 2. Must be an active status
    // 3. New Rule: If status is 'reported' (unassigned), Staff can ONLY see Low/Medium. High/Critical are hidden (Supervisor territory).
    // 4. Once 'assigned' or 'in_progress', Staff can see them regardless of priority (as they might have been assigned by Sup).
    const activeTasks = tasks.filter(t => {
        const isDeptMatch = t.department === deptFilter;
        const isActiveStatus = ['reported', 'verified', 'assigned', 'in_progress', 'on_hold'].includes(t.status);

        if (!isDeptMatch || !isActiveStatus) return false;

        // Restriction Rule
        if (t.status === 'reported') {
            const isHighSeverity = ['high', 'critical'].includes(t.priority?.toLowerCase());
            if (isHighSeverity) return false; // Hide unassigned high severity tasks from staff
        }

        return true;
    });

    const getPriorityColor = (p) => {
        switch (p?.toLowerCase()) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-orange-600 bg-orange-50';
            default: return 'text-blue-600 bg-blue-50';
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="page-title text-2xl md:text-3xl">Work Orders</h1>
                    <p className="page-subtitle text-sm md:text-base">Manage and update your assigned tasks.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                    <Link to="map" className="btn btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center">
                        <span className="text-xl">🗺️</span> View Map
                    </Link>
                    <br />
                    <div className="flex items-center gap-2 w-full sm:w-auto bg-gray-50 p-1 rounded-lg border border-gray-200">
                        <span className="text-sm font-medium text-muted pl-2">Department:</span>
                        <select
                            className="input py-1 px-3 text-sm w-full sm:w-auto border-none bg-transparent focus:ring-0"
                            value={deptFilter}
                            onChange={(e) => {
                                setDeptFilter(e.target.value);
                                e.target.blur(); // 👈 FORCE CLOSE
                            }}
                        >
                            {db.CONSTANTS.DEPARTMENTS.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <br />
            <div className="space-y-4">
                {activeTasks.length === 0 && (
                    <div className="text-center py-12 text-muted bg-white rounded-lg border border-dashed">
                        No active tasks found for {deptFilter}.
                    </div>
                )}

                {activeTasks.map(task => (
                    <Link to={`task/${task.id}`} key={task.id} className="block group">
                        <div className="bg-white p-4 md:p-6 rounded-lg border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all hover:border-[var(--color-primary)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex gap-4 items-center">
                                <div className={`p-5 rounded-full ${task.status === 'in_progress' ? 'text-orange-600' : 'text-gray-500'}`}>
                                    {task.status === 'in_progress' ? <Clock size={20} /> : <AlertCircle size={30} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-xs text-muted">#{task.id}</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                                            {task.priority || 'Normal'}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{task.type}</h3>
                                    <p className="text-muted text-sm line-clamp-1">{task.description}</p>
                                    <div className="mt-2 text-xs text-muted flex flex-wrap gap-3">
                                        <span className="flex items-center gap-1">📍 {task.location}</span>
                                        <span className="flex items-center gap-1">🕒 {new Date(task.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 pl-16 md:pl-0">
                                <span className="badge" style={{
                                    backgroundColor: `var(--status-${task.status.replace('_', '-')})`,
                                    color: 'white'
                                }}>
                                    {task.status.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-muted">View Details &rarr;</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default StaffDashboard;
