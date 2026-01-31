import React, { useState, useRef } from 'react';
import { Mic, Square, Trash2, AlertCircle } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

const AudioRecorder = ({ onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [error, setError] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);

    // 1. Determine supported MIME type (Mac vs Windows)
    const getSupportedMimeType = () => {
        const types = [
            'audio/mp4',
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus'
        ];
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        return '';
    };

    const startRecording = async () => {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mimeType = getSupportedMimeType();
            const options = mimeType ? { mimeType } : undefined;

            mediaRecorderRef.current = new MediaRecorder(stream, options);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                try {
                    const blobType = mimeType || 'audio/webm';
                    const audioBlob = new Blob(audioChunksRef.current, { type: blobType });

                    if (audioBlob.size === 0) {
                        setError("Recording failed: No audio captured.");
                        return;
                    }

                    const url = URL.createObjectURL(audioBlob);
                    setAudioUrl(url);
                    onRecordingComplete(url);
                } catch (e) {
                    setError("Failed to process recording.");
                    console.error(e);
                } finally {
                    if (streamRef.current) {
                        streamRef.current.getTracks().forEach(track => track.stop());
                        streamRef.current = null;
                    }
                    audioChunksRef.current = [];
                }
            };

            mediaRecorderRef.current.start(1000);
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Microphone access denied. Check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const deleteRecording = () => {
        setAudioUrl(null);
        onRecordingComplete(null);
        setError(null);
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 w-full ${isRecording
                ? 'bg-red-50/10 border-red-500/30 shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]'
                : 'bg-white/5 border-white/20 hover:border-blue-400/30 hover:shadow-lg'
                } backdrop-blur-xl group`}>

                <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ${isRecording ? 'from-red-500/10 to-orange-500/5 opacity-100' : 'from-blue-500/10 to-purple-500/5 opacity-50 group-hover:opacity-80'
                    }`} />

                <div className="relative z-10 p-4 flex items-center justify-between gap-4">

                    {!audioUrl ? (
                        <>
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <button
                                    type="button"
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 transform active:scale-90 flex-shrink-0 ${isRecording
                                        ? 'bg-red-500 text-white shadow-red-500/40 shadow-lg scale-110'
                                        : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/30 shadow-lg hover:shadow-blue-500/50 hover:scale-105'
                                        }`}
                                >
                                    {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={22} />}
                                </button>

                                <div className="flex flex-col min-w-0">
                                    <span className={`text-sm font-bold tracking-tight transition-colors truncate ${isRecording ? 'text-red-500' : 'text-gray-700'}`}>
                                        {isRecording ? 'Recording...' : 'Voice Note'}
                                    </span>
                                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider truncate">
                                        {isRecording ? '00:00 - 2:00' : 'Tap to Record'}
                                    </span>
                                </div>
                            </div>

                            {isRecording && (
                                <div className="flex items-center gap-1 h-6 mr-2 flex-shrink-0">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-1 bg-red-400 rounded-full animate-wave"
                                            style={{ animationDelay: `${i * 0.1}s` }}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex-1 min-w-0">
                                <AudioPlayer src={audioUrl} className="bg-white/40 border-white/40" />
                            </div>

                            <button
                                type="button"
                                onClick={deleteRecording}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100 hover:border-red-500 flex-shrink-0"
                                title="Delete & Retry"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-medium px-2 animate-pulse">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default AudioRecorder;
