import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Tooltip, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Locate, Navigation } from 'lucide-react';

// Fix Leaflet's default icon path issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Sub-component to handle map events (Click & Hover)
function MapInteractions({ setPosition, setHoverPos }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
        mousemove(e) {
            setHoverPos(e.latlng);
        },
        mouseout() {
            setHoverPos(null);
        }
    });
    return null;
}

const LocationPicker = ({ onLocationSelect, initialPosition }) => {
    // Default to 'New York' style mock coords if none provided
    const [position, setPosition] = useState(initialPosition || null);
    const [hoverPos, setHoverPos] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [hasAutoLocated, setHasAutoLocated] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    useEffect(() => {
        if (position) {
            onLocationSelect(position);
        }
    }, [position, onLocationSelect]);

    // Auto-center on mount (GPS -> Overall Location) - Passive, does NOT set pin
    useEffect(() => {
        if (navigator.geolocation && !position && !hasAutoLocated) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    // Only fly to location, do NOT set pin yet (User must click or use button)
                    if (mapInstance) {
                        mapInstance.flyTo([latitude, longitude], 14);
                        setHasAutoLocated(true);
                    }
                },
                (err) => console.warn("Auto-location optional: ", err),
                { timeout: 10000, maximumAge: 60000 }
            );
        }
    }, [mapInstance, position, hasAutoLocated]);

    const handleLocateMe = (e) => {
        e.preventDefault(); // Prevent form submission
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsLoadingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const newPos = { lat: latitude, lng: longitude };

                // 1. Set the pin explicitly
                setPosition(newPos);

                // 2. Fly to the location
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
        <div style={{ height: '350px', minHeight: '350px' }} className="w-full rounded-xl overflow-hidden border border-gray-300 relative z-0 group bg-gray-50">
            <MapContainer
                center={[40.7128, -74.0060]}
                zoom={13}
                scrollWheelZoom={true} // Enabled for better UX
                style={{ height: '100%', width: '100%' }}
                whenCreated={setMapInstance}
                ref={setMapInstance}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapInteractions setPosition={setPosition} setHoverPos={setHoverPos} />

                {position && <Marker position={position} />}

                {/* Hover Indicator (Tooltip) - Only show if not pinned or hovering away from pin */}
                {hoverPos && (
                    <Circle center={hoverPos} pathOptions={{ color: 'transparent', fillOpacity: 0 }} radius={10}>
                        <Tooltip direction="top" offset={[0, -20]} opacity={0.9} permanent>
                            {position ? "New location?" : "Click to pin"}
                        </Tooltip>
                    </Circle>
                )}
            </MapContainer>

            {/* Coordinates Display Overlay (Desktop) */}
            <div className="absolute top-2 right-2 z-[400] bg-white/90 backdrop-blur px-3 py-1.5 rounded-md text-[11px] font-mono text-gray-600 shadow-sm border border-gray-200 pointer-events-none hidden md:block">
                {hoverPos ? (
                    <div className="flex items-center gap-2">
                        <Navigation size={12} className="text-blue-500" />
                        <span>{hoverPos.lat.toFixed(5)}, {hoverPos.lng.toFixed(5)}</span>
                    </div>
                ) : (
                    <span className="text-gray-400">Hover map to view coords</span>
                )}
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-4 left-4 z-[400] flex flex-col gap-3 items-start">
                {!position && !isLoadingLocation && (
                    <div className="bg-blue-600/90 backdrop-blur text-white px-4 py-2 text-xs font-bold rounded-full shadow-lg animate-bounce mb-1 flex items-center gap-2">
                        <Locate size={14} />
                        Tap map to set location
                    </div>
                )}

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
    );
};

export default LocationPicker;
