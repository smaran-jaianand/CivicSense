import React, { useState, useRef } from 'react';
import { Mic, Square, Trash2, Play } from 'lucide-react';

const AudioRecorder = ({ onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                onRecordingComplete(url); // Send to parent
                audioChunksRef.current = []; // Reset chunks
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Microphone access denied or not available.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Stop all tracks to release mic
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const deleteRecording = () => {
        setAudioUrl(null);
        onRecordingComplete(null);
    };

    return (
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            {!audioUrl ? (
                <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex items-center gap-3 px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm ${isRecording
                            ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 animate-pulse'
                            : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:shadow'
                        }`}
                >
                    {isRecording ? <><Square size={18} /> Stop Recording</> : <><Mic size={18} /> Record Voice Note</>}
                </button>
            ) : (
                <div className="flex items-center gap-3 w-full bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                    <div className="bg-white p-1.5 rounded-full shadow-sm text-blue-600">
                        <Play size={16} fill="currentColor" />
                    </div>
                    <audio src={audioUrl} controls className="h-8 flex-1" />
                    <button
                        type="button"
                        onClick={deleteRecording}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete Recording"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )}

            {isRecording && <span className="text-red-500 text-sm font-medium animate-pulse">Recording active...</span>}
        </div>
    );
};

export default AudioRecorder;
