import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const AudioPlayer = ({ src, className = "" }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / audio.duration) * 100);
        };

        const setAudioData = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', setAudioData);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', setAudioData);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e) => {
        const seekTime = (audioRef.current.duration / 100) * e.target.value;
        audioRef.current.currentTime = seekTime;
        setProgress(e.target.value);
    };

    const toggleMute = () => {
        audioRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-2 pr-4 border border-white/20 shadow-sm w-full ${className}`}>
            <audio ref={audioRef} src={src} preload="metadata" />

            <button
                type="button"
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md hover:bg-blue-700 transition-colors flex-shrink-0"
            >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
            </button>

            <div className="flex-1 flex flex-col justify-center min-w-0">
                <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>

                <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress || 0}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
            </div>

            <button
                type="button"
                onClick={toggleMute}
                className="text-gray-400 hover:text-gray-600 transition-colors hidden sm:block"
            >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
        </div>
    );
};

export default AudioPlayer;
