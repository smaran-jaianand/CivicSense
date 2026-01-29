import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Filter, Locate, Navigation } from 'lucide-react';

const createIcon = (color, isGlow) => new L.DivIcon({
	className: `custom-marker-icon ${isGlow ? 'marker-glow-gold' : ''}`,
	html: `<div style="
        background-image: url('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png');
        background-size: contain;
        background-repeat: no-repeat;
        width: 25px;
        height: 41px;
        filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));
    "></div>`,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34]
});

const getMarkerIcon = (priority, status, isViewed) => {
	if (status === 'resolved' || status === 'closed') return createIcon('grey', false);

	// Rarity Color Map
	const colorMap = {
		'Critical': 'red',
		'High': 'orange',
		'Medium': 'blue',
		'Low': 'green'
	};

	const color = colorMap[priority] || 'blue';
	const isGlow = !isViewed && (status !== 'resolved' && status !== 'closed');

	return createIcon(color, isGlow);
};

const SupervisorMap = () => {
	const [issues, setIssues] = useState([]);
	const [viewedIds, setViewedIds] = useState(new Set());
	const [selectedSector, setSelectedSector] = useState('All'); // Added Filter State
	const [showHeatmap, setShowHeatmap] = useState(true); // Simulating heatmap with circles for now
	const [mapInstance, setMapInstance] = useState(null);
	const [isLoadingLocation, setIsLoadingLocation] = useState(false);

	const [hasAutoLocated, setHasAutoLocated] = useState(false);

	useEffect(() => {
		const all = db.getAllIssues();
		// Also load viewed IDs for Supervisor
		const storedViewed = JSON.parse(localStorage.getItem('cp_supervisor_viewed_map_ids') || '[]');
		setViewedIds(new Set(storedViewed));

		// Filter out closed ones if we only want active map
		setIssues(all.filter(i => i.status !== 'closed' && i.coordinates));
	}, []);

	const markAsViewed = (id) => {
		const newSet = new Set(viewedIds);
		newSet.add(id);
		setViewedIds(newSet);
		localStorage.setItem('cp_supervisor_viewed_map_ids', JSON.stringify([...newSet]));
	};

	// Auto-center on mount (GPS)
	useEffect(() => {
		if (navigator.geolocation && !hasAutoLocated) {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					const { latitude, longitude } = pos.coords;
					if (mapInstance) {
						mapInstance.flyTo([latitude, longitude], 14);
						setHasAutoLocated(true);
					}
				},
				(err) => console.warn("Auto-location optional: ", err),
				{ timeout: 10000, maximumAge: 60000 }
			);
		}
	}, [mapInstance, hasAutoLocated]);

	// Center map roughly on the data or default
	const center = issues.length > 0 && issues[0].coordinates
		? [issues[0].coordinates.lat, issues[0].coordinates.lng]
		: [40.7128, -74.0060];

	const handleLocateMe = () => {
		if (!navigator.geolocation) {
			alert("Geolocation is not supported by your browser");
			return;
		}

		setIsLoadingLocation(true);

		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const { latitude, longitude } = pos.coords;
				if (mapInstance) {
					mapInstance.flyTo([latitude, longitude], 16);
				}
				setIsLoadingLocation(false);
			},
			(err) => {
				console.error(err);
				setIsLoadingLocation(false);
				alert("Unable to retrieve your location. Please check browser permissions.");
			},
			{ enableHighAccuracy: true }
		);
	};

	const [showPersonModal, setShowPersonModal] = useState(false);
	const [selectedIssueId, setSelectedIssueId] = useState(null);
	const [personnel, setPersonnel] = useState([]);

	useEffect(() => {
		// Load personnel for the modal
		setPersonnel(db.getAllPersonnel());
	}, []);

	// Open the modal instead of auto-assigning
	const openAssignModal = (issueId) => {
		setSelectedIssueId(issueId);
		setShowPersonModal(true);
	};

	const handleAssignToPerson = (person) => {
		if (!selectedIssueId || !person) return;

		// 1. Update Person -> Busy
		db.updatePersonnel(person.id, { status: 'Busy' });

		// 2. Update Issue -> Assigned
		db.updateIssue(selectedIssueId, {
			status: 'assigned',
			assignedTo: { id: person.id, name: person.name }
		}, 'Supervisor');

		alert(`Assigned task to ${person.name}`);

		// Refresh Map Issues
		setIssues(db.getAllIssues());

		// Close Modal
		setShowPersonModal(false);
		setSelectedIssueId(null);
		// Refresh local personnel list to show new busy status immediately if reopened
		setPersonnel(db.getAllPersonnel());
	};

	// Filter issues based on selectedSector
	const filteredIssues = selectedSector === 'All'
		? issues
		: issues.filter(issue => issue.department === selectedSector);

	return (
		<div className="h-screen-80 w-full flex flex-col" style={{ height: '80vh' }}>
			<header className="page-header mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="page-title">Geo-Spatial Overview</h1>
					<p className="page-subtitle">Real-time issue tracking across the city grid.</p>
				</div>
				<div className="flex gap-2 w-full md:w-auto">
					<select
						className="input py-2 px-3 text-sm w-full md:w-auto"
						value={selectedSector}
						onChange={(e) => setSelectedSector(e.target.value)}
					>
						<option value="All">All Sectors</option>
						{db.CONSTANTS.DEPARTMENTS.map(d => (
							<option key={d} value={d}>{d}</option>
						))}
					</select>

					<button
						className={`btn ${showHeatmap ? 'btn-primary' : 'btn-secondary'}`}
						onClick={() => setShowHeatmap(!showHeatmap)}
					>
						{showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
					</button>
				</div>
			</header>

			{/* Explicit height wrapper to ensure map renders */}
			<div
				className="rounded-xl overflow-hidden border border-gray-300 shadow-lg relative z-0 w-full group"
				style={{ height: '650px', minHeight: '500px' }}
			>
				<MapContainer
					center={center}
					zoom={13}
					style={{ height: '100%', width: '100%' }}
					whenCreated={setMapInstance}
					ref={setMapInstance}
				>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>

					{/* Visualizing Density/Heatmap as circles */}
					{showHeatmap && issues.map(issue => (
						<Circle
							key={`heat-${issue.id}`}
							center={[issue.coordinates.lat, issue.coordinates.lng]}
							pathOptions={{
								fillColor: issue.priority === 'Critical' ? 'red' : 'yellow',
								color: 'transparent',
								fillOpacity: 0.2
							}}
							radius={400}
						/>
					))}

					{/* Markers */}
					{filteredIssues.map(issue => {
						const isViewed = viewedIds.has(issue.id);
						return (
							<Marker
								key={issue.id}
								position={[issue.coordinates.lat, issue.coordinates.lng]}
								icon={getMarkerIcon(issue.priority, issue.status, isViewed)}
								eventHandlers={{
									click: () => {
										if (!isViewed) markAsViewed(issue.id);
									}
								}}
							>
								<Popup minWidth={280} maxWidth={320}>
									<div className="p-1">
										<div className="flex justify-between items-start mb-3 gap-2">
											<strong className="text-lg font-bold leading-tight text-gray-900 pr-1">{issue.type}</strong>
											<label className="flex-shrink-0 flex items-center gap-1 cursor-pointer text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded border transition-colors select-none">
												<input
													type="checkbox"
													checked={isViewed}
													onChange={(e) => {
														if (e.target.checked) markAsViewed(issue.id);
													}}
													className="rounded border-gray-300 text-primary focus:ring-primary h-3 w-3"
												/>
												Viewed
											</label>
										</div>

										<div className="flex flex-wrap gap-2 mb-3">
											<span className={`text-xs px-2 py-1 rounded-md font-medium text-white shadow-sm ${issue.status === 'resolved' ? 'bg-gray-500' : (issue.priority === 'Critical' ? 'bg-red-600' : (issue.priority === 'High' ? 'bg-orange-500' : (issue.priority === 'Medium' ? 'bg-blue-500' : 'bg-green-600')))}`}>
												{issue.status === 'resolved' ? 'Resolved' : issue.priority}
											</span>
											<span className="text-xs px-2 py-1 rounded-md font-medium bg-white text-gray-700 border border-gray-200 shadow-sm">
												{issue.department}
											</span>
										</div>

										<p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
											{issue.description}
										</p>

										<div className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100 mb-3 space-y-1.5">
											<div className="flex items-start gap-1.5">
												<span>📍</span>
												<span className="leading-tight">{issue.location}</span>
											</div>
											<div className="flex items-center gap-1.5">
												<span>🕒</span>
												<span>{new Date(issue.createdAt).toLocaleDateString()}</span>
											</div>
										</div>

										<div className="flex flex-col gap-2 mt-3 pt-2 border-t border-gray-100">
											<a href={`/supervisor/task/${issue.id}`} className="text-blue-600 hover:underline text-sm font-semibold">View Ticket &rarr;</a>

											{(issue.priority === 'High' || issue.priority === 'Critical') && issue.status === 'reported' && (
												<div className="mt-3 flex gap-2">
													<button className="btn btn-sm btn-primary w-full" onClick={() => openAssignModal(issue.id)}>
														Assign to Person
													</button>
												</div>
											)}
										</div>
									</div>
								</Popup>
							</Marker>
						);
					})}
				</MapContainer>

				{/* Controls Overlay */}
				<div className="absolute bottom-4 left-4 z-[400] flex flex-col gap-3 items-start">
					<button
						onClick={handleLocateMe}
						type="button"
						disabled={isLoadingLocation}
						className="btn bg-white text-gray-800 hover:text-blue-600 hover:border-blue-300 shadow-lg border border-gray-200 py-2.5 px-4 text-xs font-bold flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
					>
						{isLoadingLocation ? (
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
								Getting Coordinates...
							</div>
						) : (
							<>
								<Locate size={16} />
								Use My GPS Location
							</>
						)}
					</button>
				</div>
			</div>

			<div className="mt-4 flex gap-6 text-sm">
				<div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-600"></div> Critical</div>
				<div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-400"></div> High</div>
				<div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-400"></div> Medium</div>
				<div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-600"></div> Low</div>
			</div>
			{/* Personnel Selection Modal */}
			{showPersonModal && (
				<div
					className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
					style={{ zIndex: 99999, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
				>
					<div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
						<header className="bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
							<h3 className="text-lg font-bold">Select Personnel</h3>
							<button onClick={() => setShowPersonModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
						</header>
						<div className="p-6 max-h-[60vh] overflow-y-auto">
							<div className="space-y-3">
								{personnel.filter(p => p.status === 'Available').length === 0 && (
									<p className="text-center text-gray-500">No available personnel found.</p>
								)}
								{personnel.filter(p => p.status === 'Available').map(person => (
									<div
										key={person.id}
										className="flex items-center gap-4 p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
										onClick={() => handleAssignToPerson(person)}
									>
										<div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${person.tier === 2 ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
											{person.name.charAt(0)}
										</div>
										<div>
											<p className="font-bold text-gray-900">{person.name}</p>
											<p className="text-xs text-gray-500">{person.role} • {person.department}</p>
										</div>
										{person.tier === 2 && (
											<span className="ml-auto text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">SPECIALIST</span>
										)}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default SupervisorMap;
