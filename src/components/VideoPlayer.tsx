import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Download, 
  Loader2,
  AlertCircle 
} from 'lucide-react';
// import { useAppStore } from '../store/useAppStore';
import { apiService } from '../services/apiService';

interface VideoPlayerProps {
  streamId: string;
  streamType: 'movie' | 'series';
  title: string;
  containerExtension?: string;
  onClose?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  streamId, 
  streamType, 
  title, 
  containerExtension = 'mkv',
  onClose 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideControlsTimer = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);

  // const { addDownload } = useAppStore();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const streamUrl = apiService.getStreamUrl(streamId, streamType, containerExtension);
    if (!streamUrl) {
      setError('Stream URL not available');
      setIsLoading(false);
      return;
    }

    // Set video attributes for better seeking performance
    video.preload = 'metadata';
    video.crossOrigin = 'anonymous';
    video.src = streamUrl;

    const handleLoadedMetadata = () => {
      setIsLoading(false);
      setError(null);
    };

    const handleError = () => {
      setError('Failed to load video stream');
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleSeeking = () => {
      setIsLoading(true);
    };

    const handleSeeked = () => {
      setIsLoading(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('progress', handleProgress);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('progress', handleProgress);

      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, [streamId, streamType, containerExtension]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = async () => {
    try {
      const streamUrl = apiService.getStreamUrl(streamId, streamType, containerExtension);
      if (!streamUrl) {
        throw new Error('Stream URL not available');
      }

      // Create a link element and trigger download
      const a = document.createElement('a');
      a.href = streamUrl;
      a.download = `${title}.${containerExtension}`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);

    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }

    hideControlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-dark-800 rounded-lg p-8 max-w-md mx-4">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <h3 className="text-xl font-semibold text-white">Playback Error</h3>
          </div>
          <p className="text-dark-300 mb-6">{error}</p>
          <div className="flex space-x-3">
            <button onClick={() => window.location.reload()} className="btn-primary flex-1">Retry</button>
            {onClose && (
              <button onClick={onClose} className="btn-secondary flex-1">Close</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50" onMouseMove={handleMouseMove}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onClick={togglePlay}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <span className="text-white text-lg">Loading stream...</span>
          </div>
        </div>
      )}

      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-primary-400 transition-colors"
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </button>

            <div className="flex-1 flex items-center space-x-4">
              <span className="text-white text-sm">{formatTime(currentTime)}</span>

              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
                />
                <div
                  className="absolute top-0 h-1 bg-primary-500 rounded-lg pointer-events-none"
                  style={{ width: `${buffered ? (buffered / duration) * 100 : 0}%` }}
                />
              </div>

              <span className="text-white text-sm">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-primary-400 transition-colors"
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
              />

              <button
                onClick={handleDownload}
                className="text-white hover:text-primary-400 transition-colors"
                title="Download video"
              >
                <Download className="w-6 h-6" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-primary-400 transition-colors"
              >
                <Maximize className="w-6 h-6" />
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="text-white hover:text-primary-400 transition-colors ml-2"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
