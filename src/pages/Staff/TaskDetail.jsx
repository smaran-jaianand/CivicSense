import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../services/db';
import { ArrowLeft, MapPin, CheckCircle, Clock, AlertTriangle, Play, Image as ImageIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import AudioPlayer from '../../components/AudioPlayer';

// Fix Icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
	iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const TaskDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [task, setTask] = useState(null);
	const [resolutionProof, setResolutionProof] = useState(null); // Proof State
	const [actionMessage, setActionMessage] = useState(''); // Feedback message

	useEffect(() => {
		const foundTask = db.getIssueById(id);
		if (foundTask) setTask(foundTask);
	}, [id]);

	if (!task) return <div className="p-8 text-center">Loading or Task Not Found...</div>;

	// Consolidated Action Handler
	const handleAction = (action) => {
		setActionMessage('');

		if (action === 'toggle_hold') {
			const result = db.toggleTaskHold(task.id, 'Staff Officer');
			if (result.success) {
				setActionMessage(result.message || `Task ${result.status === 'on_hold' ? 'put on hold' : 'resumed'}`);
				setTask(db.getIssueById(task.id)); // Refresh
			} else {
				alert(result.message);
			}
			return;
		}

		const updates = { status: action };

		// Attach proof if resolving
		if (action === 'resolved' && resolutionProof) {
			updates.resolutionProof = {
				url: resolutionProof,
				type: 'image',
				uploadedAt: new Date().toISOString()
			};
		}

		db.updateIssue(task.id, updates, 'Staff Officer');
		setTask(db.getIssueById(task.id));
	};

	const priorityColor = {
		'Low': 'text-green-600 bg-green-50',
		'Medium': 'text-blue-600 bg-blue-50',
		'High': 'text-orange-600 bg-orange-50',
		'Critical': 'text-red-700 bg-red-100 border border-red-200'
	}[task.priority] || 'text-gray-600';

	return (
		<div className="max-w-6xl mx-auto">
			<button onClick={() => navigate('/staff')} className="btn btn-ghost mb-4 pl-0 gap-1 text-sm text-muted hover:text-primary">
				<ArrowLeft size={16} /> Back to Board
			</button>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-6">
					<div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--color-border)]">
						<div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
							<div>
								<div className="flex items-center gap-2 mb-2">
									<span className="badge bg-gray-100 text-gray-600 mb-0 block w-max">{task.department}</span>
									{task.assignedTo && (
										<span className="badge bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
											<span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
											Officer: {task.assignedTo.name}
										</span>
									)}
									{task.status === 'on_hold' && task.lastAssignedTo && (
										<span className="badge bg-yellow-100 text-yellow-800 border border-yellow-200">
											Last: {task.lastAssignedTo.name}
										</span>
									)}
								</div>
								<h1 className="text-2xl font-bold mb-2">{task.type}</h1>
								<div className="flex items-center gap-2 text-muted text-sm">
									<MapPin size={16} /> {task.location}
								</div>
							</div>
							<div className="flex flex-row md:flex-col items-center md:items-end gap-2 w-full md:w-auto justify-between md:justify-start">
								<div className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Severity</div>
								<div className={`text-sm px-3 py-1 rounded-full font-bold ${priorityColor}`}>{task.priority}</div>
							</div>
						</div>

						<div className="prose text-gray-700 border-t pt-4 mt-4">
							<h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
							<p>{task.description}</p>
						</div>

						{/* Attachments Section */}
						<div className="mt-6 border-t pt-4">
							<h3 className="text-sm font-semibold text-gray-900 mb-4">Evidence & Attachments</h3>



							// ... (in imports)

							// ... (inside TaskDetail render)

							{/* Audio */}
							{task.attachments?.filter(a => a.type === 'audio').map((audio, idx) => (
								<div key={idx} className="w-full max-w-md mb-3">
									<div className="text-xs font-semibold text-gray-700 mb-1 ml-1">{audio.name || 'Voice Note'}</div>
									<AudioPlayer src={audio.url} className="bg-gray-50 border-gray-200" />
								</div>
							))}

							{/* Images */}
							<div className="flex gap-4 overflow-x-auto pb-2">
								{task.attachments?.filter(a => a.type === 'image').map((img, idx) => (
									<a href={img.url} target="_blank" rel="noreferrer" key={idx} className="block group relative">
										<img src={img.url} className="h-32 w-32 object-cover rounded-lg border border-gray-200 shadow-sm" alt="Evidence" />
										<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs rounded-lg">
											View Full
										</div>
									</a>
								))}
								{(!task.attachments || task.attachments.length === 0) && (
									<span className="text-sm text-muted italic">No media attachments provided.</span>
								)}
							</div>
						</div>
					</div>

					{/* Map View for Staff */}
					{task.coordinates && (
						<div className="bg-white p-1 rounded-lg shadow-sm border border-[var(--color-border)] h-80 z-0">
							<MapContainer
								center={[task.coordinates.lat, task.coordinates.lng]}
								zoom={15}
								style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
							>
								<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
								<Marker position={[task.coordinates.lat, task.coordinates.lng]}>
									<Popup>{task.type}</Popup>
								</Marker>
							</MapContainer>
						</div>
					)}

					{/* Activity Log */}
					<div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--color-border)]">
						<h3 className="text-lg font-semibold mb-4">Activity History</h3>
						{/* ... (Existing History Code) ... */}
						<div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
							{task.history.map((h, idx) => (
								<div key={idx} className="ml-6 relative">
									<span className="absolute -left-[2.05rem] bg-white border-2 border-blue-500 rounded-full w-4 h-4 mt-1"></span>
									<div className="flex justify-between items-start">
										<div>
											<p className="font-medium text-gray-900">{h.action}</p>
											<p className="text-sm text-gray-500">by {h.by}</p>
										</div>
										<span className="text-xs text-muted">{new Date(h.timestamp).toLocaleString()}</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
				<br />
				{/* Sidebar Actions */}
				<div className="space-y-6">
					<div className="bg-white p-6 rounded-lg shadow-md border border-[var(--color-border)] sticky top-24">
						<h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
						<div className="space-y-6">
							{actionMessage && (
								<div className="p-3 bg-blue-50 text-blue-700 text-sm rounded border border-blue-100 animate-in fade-in">
									{actionMessage}
								</div>
							)}

							{task.status === 'reported' && (
								<button onClick={() => handleAction('assigned')} className="btn btn-primary w-full justify-start">
									<CheckCircle size={18} /> Acknowledge & Assign
								</button>
							)}

							{(task.status === 'assigned' || task.status === 'reported') && (
								<button onClick={() => handleAction('in_progress')} className="btn btn-primary w-full justify-start bg-orange-600 hover:bg-orange-700">
									<Clock size={18} /> Start Work
								</button>
							)}
							{task.status === 'in_progress' && (
								<div className="space-y-3 p-3 bg-green-50 rounded-lg border border-green-100">
									<h4 className="text-xs font-bold text-green-800 uppercase tracking-wide">Resolution Proof</h4>

									{/* Proof Preview */}
									{resolutionProof && (
										<div className="relative group w-full h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
											<img src={resolutionProof} alt="Proof" className="w-full h-full object-cover" />
											<button
												onClick={() => setResolutionProof(null)}
												className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
											>
												<AlertTriangle size={12} />
											</button>
										</div>
									)}

									{!resolutionProof && (
										<label className="flex items-center gap-2 text-sm text-green-700 cursor-pointer hover:underline">
											<ImageIcon size={16} />
											{resolutionProof ? 'Change Photo' : 'Upload Evidence Photo'}
											<input
												type="file"
												accept="image/*"
												className="hidden"
												onChange={(e) => {
													const file = e.target.files[0];
													if (file) setResolutionProof(URL.createObjectURL(file));
												}}
											/>
										</label>
									)}

									<button
										onClick={() => handleAction('resolved')}
										className="btn btn-primary w-full justify-start bg-green-600 hover:bg-green-700"
										disabled={!resolutionProof} // Enforce proof requirement
									>
										<CheckCircle size={18} /> Complete & Resolve
									</button>
									{!resolutionProof && <p className="text-[10px] text-green-600/70 text-center">* Proof required to resolve</p>}
								</div>
							)}
							{/* Hold / Resume Logic */}
							{!['resolved', 'closed'].includes(task.status) && task.status !== 'reported' && (
								<button
									onClick={() => handleAction('toggle_hold')}
									className={`btn w-full justify-start ${task.status === 'on_hold' ? 'btn-primary bg-emerald-600 hover:bg-emerald-700' : 'btn-secondary'}`}
								>
									{task.status === 'on_hold' ? <Play size={18} /> : <AlertTriangle size={18} />}
									{task.status === 'on_hold' ? 'Resume Work' : 'Put On Hold'}
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TaskDetail;
