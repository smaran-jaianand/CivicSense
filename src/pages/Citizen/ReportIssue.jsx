import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/db';
import LocationPicker from '../../components/LocationPicker';
import AudioRecorder from '../../components/AudioRecorder';
import { MapPin, Camera, AlertTriangle, Mic, Image as ImageIcon } from 'lucide-react';

const ReportIssue = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: '',
        location: '',
        description: '',
        severity: 'Medium',
        coordinates: null
    });

    const [attachments, setAttachments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.coordinates) {
            alert("Please map the location of the issue.");
            return;
        }

        setIsSubmitting(true);

        const issuePayload = {
            ...formData,
            attachments: attachments
        };

        // Simulate network delay then show success
        setTimeout(() => {
            db.createIssue(issuePayload);
            setIsSubmitting(false);
            setShowSuccess(true);

            // Redirect after animation
            setTimeout(() => {
                navigate('/citizen'); // Redirect to Citizen Home
            }, 2500);
        }, 800);
    };

    if (showSuccess) {
        return (
            <div className="success-overlay flex-col text-center">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-scale-up shadow-xl mb-6">
                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-white fill-none stroke-current stroke-[3] animate-draw-check">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 animate-scale-up" style={{ animationDelay: '0.2s' }}>Report Sent!</h2>
                <p className="text-gray-500 mt-2 animate-scale-up" style={{ animationDelay: '0.3s' }}>Thank you for helping your city.</p>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLocationSelect = React.useCallback(async (latlng) => {
        // Prevent unnecessary updates if coordinates haven't changed (deep comparison)
        setFormData(prev => {
            if (prev.coordinates && prev.coordinates.lat === latlng.lat && prev.coordinates.lng === latlng.lng) {
                return prev; // No state update -> No re-render loop
            }
            return {
                ...prev,
                coordinates: latlng
            };
        });

        // Only fetch address if we actually updated (or check ref), but simple debounce/check is usually enough.
        // Reverse Geocoding using standard OSM Nominatim API
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
            const data = await response.json();
            if (data && data.display_name) {
                const shortAddress = data.display_name.split(',').slice(0, 4).join(',');
                setFormData(prev => {
                    if (prev.location === shortAddress) return prev;
                    return { ...prev, location: shortAddress };
                });
            }
        } catch (error) {
            console.error("Failed to fetch address:", error);
        }
    }, [/* No dependencies needed as setFormData is stable */]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAttachments(prev => [...prev, { type: 'image', url, name: file.name }]);
        }
    };

    const handleAudioRecorded = (url) => {
        if (url) {
            setAttachments(prev => [...prev, { type: 'audio', url, name: 'Voice Memo' }]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mb-14">
            <header className="page-header text-center py-8">
                <h1 className="page-title text-3xl mb-2">Report an Issue</h1>
                <p className="page-subtitle text-lg">Add details, photos, and location to help us resolve it faster.</p>
            </header>

            <div className="card-premium p-8">
                <form onSubmit={handleSubmit} className="flex flex-col gap-8">

                    <div className="md:grid md:grid-cols-2 md:gap-8 space-y-8 md:space-y-0">
                        {/* Issue Type */}
                        <div className="md:col-span-1">
                            <label htmlFor="type" className="text-sm font-semibold text-gray-700">Category</label>
                            <select
                                id="type"
                                name="type"
                                required
                                className="input w-full mt-1 h-12"
                                value={formData.type}
                                onChange={handleChange}
                            >
                                <option value="">Select Category...</option>
                                {db.CONSTANTS.ISSUE_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Severity */}
                        <div className="md:col-span-1">
                            <label htmlFor="severity" className="text-sm font-semibold text-gray-700">Urgency Level</label>
                            <select
                                id="severity"
                                name="severity"
                                className="input w-full mt-1 h-12"
                                value={formData.severity}
                                onChange={handleChange}
                            >
                                <option value="Low">Low - Cosmetic/Minor</option>
                                <option value="Medium">Medium - Standard Issue</option>
                                <option value="High">High - Urgent Attention</option>
                                <option value="Critical">Critical - Safety Hazard</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="text-sm font-semibold text-gray-700">Description & Details</label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            rows="4"
                            placeholder="Describe the issue clearly..."
                            className="input mt-1"
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-6 border-t border-gray-100">
                        {/* Map Section */}
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-gray-700">Pin Exact Location <span className="text-red-500">*</span></span>
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${formData.coordinates ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {formData.coordinates ? 'Location Pinned' : 'Selection Required'}
                                    </span>
                                </label>
                                <div className="rounded-xl overflow-hidden border border-gray-300 shadow-sm h-80 w-full">
                                    <LocationPicker onLocationSelect={handleLocationSelect} />
                                </div>
                            </div>

                            {/* Address Text (Auto-filled) */}
                            <div>
                                <label htmlFor="location" className="text-sm font-semibold text-gray-700">Location Address</label>
                                <div className="relative mt-1">
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        required
                                        placeholder="Address will auto-fill from map..."
                                        className="input pl-10"
                                        value={formData.location}
                                        onChange={handleChange}
                                    />
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                                <p className="text-xs text-muted mt-1 ml-1">Pin map to auto-fill, or type manually.</p>
                            </div>
                        </div>

                        {/* Media Section */}
                        <div className="flex flex-col gap-8">
                            {/* Voice Memo */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">Voice Note</label>
                                <AudioRecorder onRecordingComplete={handleAudioRecorded} />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">Photo Evidence</label>
                                <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center gap-3 hover:bg-gray-100 transition-colors cursor-pointer group hover:border-blue-400">
                                    <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                                        <ImageIcon className="text-blue-500" size={32} />
                                    </div>
                                    <div className="text-center">
                                        <label className="text-primary font-bold cursor-pointer hover:underline text-lg">
                                            Click to Upload
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        </label>
                                        <p className="text-sm text-gray-500 mt-1">or drag and drop here</p>
                                    </div>
                                    <p className="text-xs text-gray-400">Supports JPG, PNG (Max 5MB)</p>
                                </div>

                                {/* Preview Grid */}
                                {attachments.length > 0 && (
                                    <div className="flex gap-4 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                                        {attachments.filter(a => a.type === 'image').map((img, idx) => (
                                            <div key={idx} className="h-24 w-24 rounded-lg border border-gray-200 overflow-hidden relative shadow-sm flex-shrink-0 group">
                                                <img src={img.url} alt="evidence" className="h-full w-full object-cover" />
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 mt-4">
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-4 text-xl shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 rounded-xl">
                            {isSubmitting ? 'Submitting Report...' : 'Submit Issue Report'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ReportIssue;
