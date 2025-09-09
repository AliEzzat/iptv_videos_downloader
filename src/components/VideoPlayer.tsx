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
import Hls from 'hls.js';
// import { useAppStore } from '../store/useAppStore';
import { apiService } from '../services/apiService';

interface VideoPlayerProps {
  streamId: string;
  streamType: 'movie' | 'series' | 'live';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<string>('contain');

  // const { addDownload } = useAppStore();

  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const effectiveExt = streamType === 'live' ? 'ts' : (containerExtension || 'mkv');
    const streamUrl = apiService.getStreamUrl(streamId, streamType, effectiveExt);
    if (!streamUrl) {
      setError('Stream URL not available');
      setIsLoading(false);
      return;
    }

    // Set video attributes for better seeking performance
    video.preload = 'auto';
    video.autoplay = true;
    video.playsInline = true;

    if ((streamUrl.endsWith('.m3u8') || streamType === 'live') && Hls.isSupported()) {
      const hls = new Hls({
        liveSyncDurationCount: 3,
        enableWorker: true,
        backBufferLength: 0,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return () => {
        hlsRef.current = null;
        hls.destroy();
      };
    } else {
      video.src = streamUrl;
    }

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
      if (streamType !== 'live') {
        setIsLoading(true);
      }
    };

    const handleSeeked = () => {
      if (streamType !== 'live') {
        setIsLoading(false);
      }
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
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };
  }, []);

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
    if (streamType === 'live') return; // disable seek on live

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

  // Remote control key handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;
      setShowControls(true);
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
      hideControlsTimer.current = window.setTimeout(() => setShowControls(false), 3000);

      switch (e.key) {
        case 'Enter': // OK
          e.preventDefault();
          togglePlay();
          break;
        case ' ': // space
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (streamType !== 'live') {
            video.currentTime = Math.max(0, video.currentTime - 10);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (streamType !== 'live') {
            video.currentTime = Math.min(video.duration || video.currentTime + 10, video.currentTime + 10);
          } else {
            // jump to live edge if possible
            try { hlsRef.current?.seekToLivePosition?.(); } catch (_) {}
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          setVolume(video.volume);
          setIsMuted(video.volume === 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          setVolume(video.volume);
          setIsMuted(video.volume === 0);
          break;
        case 'Backspace':
        case 'Escape':
          e.preventDefault();
          if (onClose) onClose();
          else window.history.back();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          cycleAspectRatio();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      const streamUrl = apiService.getStreamUrl(streamId, streamType, containerExtension);
      if (!streamUrl) throw new Error('Stream URL not available');

      // Create download request without credentials
      const response = await fetch(streamUrl, {
        method: 'GET',
        mode: 'cors'
      });

      if (!response.ok) throw new Error('Failed to fetch video stream');

      const contentLength = response.headers.get('Content-Length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      // Create response reader
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get stream reader');

      let received = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        if (value) {
          chunks.push(value);
          received += value.length;
          
          if (total) {
            const progress = Math.round((received / total) * 100);
            setDownloadProgress(progress);
          }
        }
      }

      // Create and trigger download
      const blob = new Blob(chunks, { 
        type: `video/${containerExtension}` 
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.${containerExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const aspectRatioOptions = [
    { value: 'contain', label: 'Fit Screen' },
    { value: 'cover', label: 'Fill Screen' },
    { value: '16/9', label: '16:9' },
    { value: '4/3', label: '4:3' },
    { value: '21/9', label: '21:9' },
    { value: '1/1', label: 'Square' }
  ];

  const cycleAspectRatio = () => {
    const currentIndex = aspectRatioOptions.findIndex(option => option.value === aspectRatio);
    const nextIndex = (currentIndex + 1) % aspectRatioOptions.length;
    setAspectRatio(aspectRatioOptions[nextIndex].value);
    const video = videoRef.current;
    if (!video) return;
    video.style.aspectRatio = aspectRatioOptions[nextIndex].value;
  };

  const getVideoStyle = () => {
    switch (aspectRatio) {
      case 'contain':
        return { objectFit: 'contain' as const };
      case 'cover':
        return { objectFit: 'cover' as const };
      case '16/9':
        return { objectFit: 'contain' as const, aspectRatio: '16/9' };
      case '4/3':
        return { objectFit: 'contain' as const, aspectRatio: '4/3' };
      case '21/9':
        return { objectFit: 'contain' as const, aspectRatio: '21/9' };
      case '1/1':
        return { objectFit: 'contain' as const, aspectRatio: '1/1' };
      default:
        return { objectFit: 'contain' as const };
    }
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
    <div
      className="fixed inset-0 bg-black z-50"
      onMouseMove={handleMouseMove}
      style={{ cursor: 'default' }}
      tabIndex={0}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        style={getVideoStyle()}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <span className="text-white text-lg">Loading stream...</span>
          </div>
        </div>
      )}

      {showControls && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8 transition-opacity duration-300"
          onClick={e => e.stopPropagation()}
        >
          <div className="video-controls space-y-6">
            {/* Progress Bar */}
            <div className="flex items-center space-x-6">
              <span className="text-white text-xl font-mono min-w-[80px]">{formatTime(currentTime)}</span>
              
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-3 bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
                  }}
                />
                <div
                  className="absolute top-0 h-3 bg-blue-400 rounded-lg pointer-events-none opacity-60"
                  style={{ width: `${buffered ? (buffered / duration) * 100 : 0}%` }}
                />
              </div>
              
              <span className="text-white text-xl font-mono min-w-[80px]">{formatTime(duration)}</span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center space-x-8">
              <button 
                className="bg-primary-600 hover:bg-primary-700 text-white p-6 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-400" 
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-12 h-12" /> : <Play className="w-12 h-12" />}
              </button>

              <button
                onClick={toggleMute}
                className="bg-dark-700 hover:bg-dark-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-400"
              >
                {isMuted ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
              </button>

              <div className="flex items-center space-x-4">
                <span className="text-white text-lg">Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-32 h-3 bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <button
                onClick={handleDownload}
                className="bg-dark-700 hover:bg-dark-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-400"
                title="Download video"
              >
                <Download className="w-8 h-8" />
              </button>

              <button
                onClick={cycleAspectRatio}
                className="bg-dark-700 hover:bg-dark-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-400"
                title={`Aspect Ratio: ${aspectRatioOptions.find(opt => opt.value === aspectRatio)?.label} (Press R)`}
              >
                <span className="text-lg font-bold">AR</span>
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-400"
                >
                  <span className="text-xl font-bold">✕</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isDownloading && (
        <div className="absolute top-0 left-0 right-0 bg-black/80 p-4 flex flex-col items-center">
          <div className="text-white mb-2">
            Downloading: {downloadProgress}%
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress || 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Aspect Ratio Indicator */}
      {showControls && (
        <div className="absolute top-6 right-6 bg-black/80 text-white px-6 py-3 rounded-lg text-xl font-semibold border border-white/20">
          {aspectRatioOptions.find(opt => opt.value === aspectRatio)?.label}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
