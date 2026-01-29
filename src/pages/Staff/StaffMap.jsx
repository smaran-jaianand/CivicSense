import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Locate } from 'lucide-react';

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

const StaffMap = () => {
    const [issues, setIssues] = useState([]);
    const [viewedIds, setViewedIds] = useState(new Set());
    const [selectedSector, setSelectedSector] = useState('All');
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [mapInstance, setMapInstance] = useState(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [hasAutoLocated, setHasAutoLocated] = useState(false);

    useEffect(() => {
        const all = db.getAllIssues();
        // Staff sees all active issues on map for context
        // Also load viewed IDs
        const storedViewed = JSON.parse(localStorage.getItem('cp_staff_viewed_map_ids') || '[]');
        setViewedIds(new Set(storedViewed));
        setIssues(all.filter(i => i.coordinates)); // Show all with coords, resolved will be grey
    }, []);

    const markAsViewed = (id) => {
        const newSet = new Set(viewedIds);
        newSet.add(id);
        setViewedIds(newSet);
        localStorage.setItem('cp_staff_viewed_map_ids', JSON.stringify([...newSet]));
    };

    // Filter Logic
    const filteredIssues = issues.filter(i => {
        if (selectedSector !== 'All' && i.department !== selectedSector) return false;
        return true;
    });

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

    return (
        <div className="h-screen-80 w-full flex flex-col" style={{ height: '80vh' }}>
            <header className="page-header mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="page-title text-2xl md:text-3xl">City Map View</h1>
                    <p className="page-subtitle text-sm md:text-base">Visual overview of reported issues.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-center">
                    <select
                        className="input py-1 px-3 text-sm w-full sm:w-auto"
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                    >
                        <option value="All">All Sectors</option>
                        {db.CONSTANTS.DEPARTMENTS.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>

                    <button
                        className={`btn w-full md:w-auto ${showHeatmap ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setShowHeatmap(!showHeatmap)}
                    >
                        {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
                    </button>
                </div>
            </header>

            <div
                className="rounded-xl overflow-hidden border border-gray-300 shadow-lg relative z-0 w-full group"
                style={{ height: '65vh', minHeight: '400px' }}
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

                    {/* Heatmap Visualization */}
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

                                        <a
                                            href={`/staff/task/${issue.id}`}
                                            className="flex items-center justify-center w-full bg-white hover:bg-gray-50 text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg py-2 text-sm font-semibold transition-all shadow-sm"
                                        >
                                            View Full Details
                                        </a>
                                    </div>
                                </Popup>
                                <Tooltip direction="top" offset={[0, -40]} opacity={1}>
                                    <div className="text-center">
                                        <strong>{issue.type}</strong><br />
                                        <span className={issue.status === 'resolved' ? 'text-gray-500' : (issue.priority === 'Critical' ? 'text-red-600' : 'text-blue-600')}>{issue.status}</span>
                                    </div>
                                </Tooltip>
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

            <div className="mt-4 flex flex-wrap gap-4 md:gap-6 text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-600"></div> Critical</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> High</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Medium</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-600"></div> Low</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-500"></div> Resolved</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600 shadow-[0_0_8px_gold]"></div> Unseen (Glowing)</div>
            </div>
        </div>
    );
};

export default StaffMap;
