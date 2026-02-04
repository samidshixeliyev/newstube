import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import './App.css';

const CHUNK_SIZE = 10 * 1024 * 1024;

function App() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Ready');
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVideos, setFilteredVideos] = useState([]);

  const fetchVideos = async () => {
    try {
      const r = await fetch('http://localhost:8080/api/upload/videos');
      if (!r.ok) {
        console.error(`Videos failed: ${r.status}`);
        setStatus(`Error loading list: ${r.status}`);
        return;
      }

      const data = await r.json();
      
      setVideos(prevVideos => {
        const hasChanged = JSON.stringify(prevVideos) !== JSON.stringify(data);
        return hasChanged ? data : prevVideos;
      });
      
      setFilteredVideos(data);

      const processing = data.filter(v => v.status === 'processing').length;
      if (processing > 0) {
        setStatus(`Processing ${processing} video(s)...`);
      } else if (status.includes('Processing')) {
        setStatus('Ready');
      }
    } catch (err) {
      console.error('Fetch videos error:', err);
      setStatus('Cannot connect to server');
    }
  };

  useEffect(() => {
    fetchVideos();
    const timer = setInterval(fetchVideos, 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVideos(videos);
    } else {
      const filtered = videos.filter(v => 
        v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVideos(filtered);
    }
  }, [searchQuery, videos]);

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
    if (e.target.files?.[0]) {
      setProgress(0);
      setStatus('Ready to upload');
    }
  };

  const uploadChunk = async (chunk, index, total, name) => {
    const form = new FormData();
    form.append('file', chunk);
    form.append('chunkIndex', index);
    form.append('totalChunks', total);
    form.append('filename', name);

    const r = await fetch('http://localhost:8080/api/upload/chunk', {
      method: 'POST',
      body: form,
    });

    if (!r.ok) throw new Error(`Chunk ${index + 1} failed: ${r.status}`);
    return r.json();
  };

  const startUpload = async () => {
    if (!file) return;

    setStatus('Uploading...');
    setProgress(0);

    const total = Math.ceil(file.size / CHUNK_SIZE);
    const name = file.name;

    try {
      await fetch('http://localhost:8080/api/upload/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          filename: name,
          title: name.replace(/\.[^/.]+$/, ''),
          totalSize: file.size.toString(),
          totalChunks: total.toString(),
        }),
      });

      for (let i = 0; i < total; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        await uploadChunk(chunk, i, total, name);
        setProgress(Math.round(((i + 1) / total) * 100));
      }

      const r = await fetch('http://localhost:8080/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          filename: name,
          totalChunks: total.toString(),
        }),
      });

      const res = await r.json();

      if (res.status === 'processing_started') {
        setStatus('Upload finished. Transcoding started...');
        setFile(null);
        setTimeout(fetchVideos, 3000);
      } else {
        setStatus('Error: ' + (res.message || 'Unknown response'));
      }
    } catch (err) {
      console.error(err);
      setStatus('Upload failed: ' + err.message);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <svg viewBox="0 0 24 24" className="logo-icon">
              <path d="M21.43 8.58A3.07 3.07 0 0 0 19.13 7H4.87A3.07 3.07 0 0 0 2.57 8.58 4.64 4.64 0 0 0 2 11.5v5a4.64 4.64 0 0 0 .57 2.92A3.07 3.07 0 0 0 4.87 21h14.26a3.07 3.07 0 0 0 2.3-1.08A4.64 4.64 0 0 0 22 16.5v-5a4.64 4.64 0 0 0-.57-2.92zM9.5 15.5v-7l6 3.5-6 3.5z"/>
            </svg>
            <span className="logo-text">LocalTube</span>
          </div>
        </div>
        
        <div className="header-center">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="header-right">
          <button className="upload-trigger-btn" onClick={() => document.getElementById('video-upload').click()}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
            <span>Upload</span>
          </button>
        </div>
      </header>

      {/* Upload Section (Modal-style) */}
      {file && (
        <div className="upload-modal">
          <div className="upload-modal-content">
            <div className="upload-modal-header">
              <h3>Upload Video</h3>
              <button className="close-btn" onClick={() => setFile(null)}>×</button>
            </div>
            
            <div className="upload-modal-body">
              <div className="file-info">
                <svg viewBox="0 0 24 24" width="48" height="48" className="file-icon">
                  <path d="M18 20H4V6h9v5h5v9zm-7.5-7c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5S9 15.3 9 14.5s.7-1.5 1.5-1.5m5 3.7l-1.9-2.3-2.1 2.8-1.5-2L7 18h11z"/>
                </svg>
                <div>
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                </div>
              </div>

              {progress > 0 && (
                <div className="upload-progress">
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="progress-info">
                    <span>{progress}%</span>
                    <span>{status}</span>
                  </div>
                </div>
              )}

              <button
                onClick={startUpload}
                disabled={progress > 0}
                className="modal-upload-btn"
              >
                {progress > 0 ? 'Uploading...' : 'Start Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="file-input-hidden"
        id="video-upload"
      />

      {/* Main Content */}
      <main className="main-content">
        {filteredVideos.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" width="120" height="120" className="empty-icon">
              <path d="M18 20H4V6h9v5h5v9zm-7.5-7c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5S9 15.3 9 14.5s.7-1.5 1.5-1.5m5 3.7l-1.9-2.3-2.1 2.8-1.5-2L7 18h11z"/>
            </svg>
            <h2>No videos yet</h2>
            <p>Upload your first video to get started</p>
          </div>
        ) : (
          <div className="video-grid">
            {filteredVideos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ────────────────────────────────────────────────
//  Video Card Component
// ────────────────────────────────────────────────
function VideoCard({ video }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [selectedQuality, setSelectedQuality] = useState('auto');
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    if (video.status !== 'ready' || !video.hlsUrl || !videoRef.current) {
      return;
    }

    if (isInitialized && hlsRef.current) {
      return;
    }

    const videoElement = videoRef.current;
    const hlsUrl = `http://localhost:8080${video.hlsUrl}`;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        capLevelToPlayerSize: false,
        startLevel: -1,
      });

      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(videoElement);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsInitialized(true);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        const level = hls.levels[data.level];
        if (level) {
          setCurrentQuality(`${level.height}p`);
        }
      });

      return () => {
        hls.destroy();
        setIsInitialized(false);
      };
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = hlsUrl;
      setIsInitialized(true);
    }
  }, [video.name, video.hlsUrl, video.status]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQualityChange = (quality) => {
    if (!hlsRef.current) return;

    setSelectedQuality(quality);
    const hls = hlsRef.current;

    if (quality === 'auto') {
      hls.currentLevel = -1;
    } else {
      const targetHeight = parseInt(quality);
      const levelIndex = hls.levels.findIndex(level => level.height === targetHeight);
      if (levelIndex !== -1) {
        hls.currentLevel = levelIndex;
      }
    }
    setShowSettings(false);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = pos * duration;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (video.status === 'processing') {
    return (
      <div className="video-card">
        <div className="video-thumbnail processing-thumbnail">
          <div className="processing-overlay">
            <div className="spinner"></div>
            <span>Processing...</span>
          </div>
        </div>
        <div className="video-info">
          <h3 className="video-title">{video.title || video.name}</h3>
          <p className="video-meta">Generating quality levels...</p>
        </div>
      </div>
    );
  }

  if (video.status !== 'ready' || !video.hlsUrl) {
    return (
      <div className="video-card">
        <div className="video-thumbnail error-thumbnail">
          <span>⚠️ Error</span>
        </div>
        <div className="video-info">
          <h3 className="video-title">{video.title || video.name}</h3>
          <p className="video-meta error-text">Failed to process</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-card">
      <div className="video-player-container">
        <video
          ref={videoRef}
          className="video-element"
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
        />
        
        {/* Custom Controls */}
        <div className="video-controls">
          <div className="progress-bar" onClick={handleSeek}>
            <div 
              className="progress-filled" 
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>
          
          <div className="controls-row">
            <div className="controls-left">
              <button className="control-btn" onClick={togglePlay}>
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
              
              <div className="volume-control">
                <button 
                  className="control-btn"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                  </svg>
                </button>
                {showVolumeSlider && (
                  <div 
                    className="volume-slider"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={handleVolumeChange}
                    />
                  </div>
                )}
              </div>
              
              <span className="time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <div className="controls-right">
              <div className="quality-badge">{currentQuality}</div>
              
              <div className="settings-menu" ref={settingsRef}>
                <button 
                  className="control-btn settings-btn"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                  </svg>
                </button>
                
                {showSettings && (
                  <div className="settings-dropdown">
                    <div className="settings-header">Quality</div>
                    <button
                      className={`quality-option ${selectedQuality === 'auto' ? 'active' : ''}`}
                      onClick={() => handleQualityChange('auto')}
                    >
                      <span>Auto</span>
                      {selectedQuality === 'auto' && <span className="checkmark">✓</span>}
                    </button>
                    {video.qualities?.map(q => (
                      <button
                        key={q}
                        className={`quality-option ${selectedQuality === q.replace('p', '') ? 'active' : ''}`}
                        onClick={() => handleQualityChange(q.replace('p', ''))}
                      >
                        <span>{q}</span>
                        {selectedQuality === q.replace('p', '') && <span className="checkmark">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="video-info">
        <h3 className="video-title">{video.title || video.name}</h3>
        <div className="video-meta">
          <span>{video.views || 0} views</span>
          <span>•</span>
          <span>{video.likes || 0} likes</span>
          {video.duration && (
            <>
              <span>•</span>
              <span>{formatTime(video.duration)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;