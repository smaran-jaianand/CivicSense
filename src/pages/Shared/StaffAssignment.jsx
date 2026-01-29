import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { UserPlus, User, Briefcase, ShieldAlert, CheckCircle2, Clock, X } from 'lucide-react';

const StaffAssignment = ({ viewMode = 'general' }) => {
    // viewMode: 'general' (Tier 1 only) | 'all' (Tier 1 & 2)
    const [personnel, setPersonnel] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);

    // Assignment State
    const [assignTarget, setAssignTarget] = useState(null); // The person being assigned
    const [showAssignModal, setShowAssignModal] = useState(false);

    const [newStaff, setNewStaff] = useState({
        name: '',
        role: '',
        department: 'Public Works',
        tier: 1 // Default to 1
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const allPeople = db.getAllPersonnel();
        setPersonnel(allPeople);

        // Fetch unassigned tasks
        const allIssues = db.getAllIssues();
        // Definition of "Unassigned": Status is reported or verified, AND not assigned to a person yet
        // For simplicity, we assume if status is 'reported' or 'verified' it is unassigned.
        // We filter for tasks that need action.
        const unassigned = allIssues.filter(i => ['reported', 'verified'].includes(i.status));
        setTasks(unassigned);
    };

    // Filter logic
    const displayedPersonnel = personnel.filter(p => {
        if (viewMode === 'general') {
            return p.tier === 1;
        }
        return true; // value 'all' shows everything
    });

    const handleAdd = (e) => {
        e.preventDefault();
        db.addPersonnel(newStaff);
        setShowAddForm(false);
        setNewStaff({ name: '', role: '', department: 'Public Works', tier: 1 });
        loadData();
    };

    const handleOpenAssign = (person) => {
        if (person.status !== 'Available') {
            if (!confirm(`This person is currently ${person.status}. Do you still want to assign them a new task?`)) {
                return;
            }
        }

        console.log("Opening assign modal for:", person.name);
        // Force refresh tasks
        const allIssues = db.getAllIssues();
        const unassigned = allIssues.filter(i => ['reported', 'verified'].includes(i.status));
        setTasks(unassigned);

        setAssignTarget(person);
        setShowAssignModal(true);
    };

    const handleAssignTask = (taskId) => {
        if (!assignTarget) return;

        // 1. Update the Person -> Busy
        db.updatePersonnel(assignTarget.id, { status: 'Busy' });

        // 2. Update the Issue -> Status 'assigned', AssignedTo: person.name
        db.updateIssue(taskId, {
            status: 'assigned',
            assignedTo: { id: assignTarget.id, name: assignTarget.name }
        }, 'Supervisor');

        alert(`Successfully assigned task to ${assignTarget.name}`);

        // Close and Refresh
        setShowAssignModal(false);
        setAssignTarget(null);
        loadData();
    };

    const getStatusStyle = (status) => {
        // Just text color, no box
        switch (status) {
            case 'Available': return 'text-green-600';
            case 'Busy': return 'text-red-500';
            case 'On Leave': return 'text-orange-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="max-w-6xl mx-auto relative">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="page-title">Personnel & Assignments</h1>
                    <p className="page-subtitle">
                        {viewMode === 'general' ? 'Manage general staff availability.' : 'Manage all department resources and specialists.'}
                    </p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <UserPlus size={18} />
                    Add Personnel
                </button>
            </header>

            {/* Application & Form Section */}
            {showAddForm && (
                <div className="mb-8 p-6 bg-white rounded-xl border border-blue-100 shadow-lg animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold mb-4">Add New Staff Member</h3>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div className="lg:col-span-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                            <input
                                required
                                type="text"
                                className="input mt-1 w-full"
                                placeholder="Full Name"
                                value={newStaff.name}
                                onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                            <input
                                required
                                type="text"
                                className="input mt-1 w-full"
                                placeholder="e.g. Driver"
                                value={newStaff.role}
                                onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Department</label>
                            <select
                                className="input mt-1 w-full"
                                value={newStaff.department}
                                onChange={e => setNewStaff({ ...newStaff, department: e.target.value })}
                            >
                                {db.CONSTANTS.DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        {/* Only Supervisors can add Tier 2 */}
                        {viewMode === 'all' && (
                            <div className="lg:col-span-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Clearance</label>
                                <select
                                    className="input mt-1 w-full"
                                    value={newStaff.tier}
                                    onChange={e => setNewStaff({ ...newStaff, tier: parseInt(e.target.value) })}
                                >
                                    <option value={1}>Tier 1 - General</option>
                                    <option value={2}>Tier 2 - Specialist</option>
                                </select>
                            </div>
                        )}

                        <div className="lg:col-span-1">
                            <button type="submit" className="btn btn-primary w-full">Confirm Add</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Staff List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedPersonnel.map(person => (
                    <div key={person.id} className={`bg-white rounded-2xl p-0 border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group relative flex flex-col ${person.tier === 2 ? 'border-purple-200' : 'border-gray-100'}`}>

                        {/* Header / Banner Area */}
                        <div className={`h-20 w-full ${person.tier === 2 ? 'bg-gradient-to-r from-purple-500 to-indigo-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}>
                            {/* Specialist Badge */}
                            {person.tier === 2 && (
                                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/20">
                                    ★ SPECIALIST
                                </div>
                            )}
                        </div>

                        {/* Card Content */}
                        <div className="px-5 pb-5 flex-1 flex flex-col pt-0 mt-[-40px]">
                            {/* Avatar Section */}
                            <div className="flex justify-between items-end mb-3">
                                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-gray-100">
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}&backgroundColor=b6e3f4`}
                                        alt={person.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {/* Clean Text Status */}
                                <div className={`text-sm font-bold ${getStatusStyle(person.status)}`}>
                                    {person.status}
                                </div>
                            </div>

                            {/* Info */}
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg truncate" title={person.name}>{person.name}</h3>
                                <p className="text-sm text-blue-600 font-medium mb-1 truncate">{person.role}</p>
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                    <Briefcase size={12} />
                                    {person.department}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                                <button className="btn btn-sm bg-gray-50 text-gray-700 hover:bg-gray-100 border-none font-medium">Profile</button>
                                <button
                                    onClick={() => handleOpenAssign(person)}
                                    className={`btn btn-sm font-medium ${person.status === 'Available' ? 'btn-primary' : 'bg-gray-100 text-gray-500'}`}
                                >
                                    Assign
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {displayedPersonnel.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed text-gray-500">
                    No personnel found matching the criteria.
                </div>
            )}

            {/* Assignment Modal */}
            {showAssignModal && assignTarget && (
                <div
                    className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    style={{ zIndex: 99999, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
                >
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <header className="bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Assign Task</h3>
                                <p className="text-sm text-gray-500">Assigning to <span className="text-blue-600 font-semibold">{assignTarget.name}</span></p>
                            </div>
                            <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </header>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {tasks.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No unassigned tasks found.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {tasks.map(task => (
                                        <div key={task.id} className="border rounded-lg p-3 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors group" onClick={() => handleAssignTask(task.id)}>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-gray-800">{task.type}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded text-white ${task.priority === 'Critical' ? 'bg-red-500' : 'bg-blue-400'}`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-1 mb-2">{task.description}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <span>📍 {task.location}</span>
                                                <span>•</span>
                                                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="mt-2 text-right hidden group-hover:block text-blue-600 text-xs font-bold">
                                                Click to Assign &rarr;
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffAssignment;
