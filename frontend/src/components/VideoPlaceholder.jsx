import { useState, useRef, useEffect } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * VideoPlaceholder Component
 * ==========================
 * Displays video content with audio narration and AI video generation
 * 
 * Phase 4: AI Video Generation using AIML/Kling API
 * 
 * Props:
 * - script: The generated educational script
 * - topic: The main topic for display
 */
export default function VideoPlaceholder({ script, topic }) {
  const [showScript, setShowScript] = useState(true);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioData, setAudioData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const audioRef = useRef(null);
  
  // Video generation state
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoGenerationId, setVideoGenerationId] = useState(null);
  const [videoStatus, setVideoStatus] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoError, setVideoError] = useState(null);

  // Generate a simple title from the topic
  const videoTitle = topic ? `${topic} Explained` : "Understanding the Concept";

  // Poll for video status when generating
  useEffect(() => {
    let interval;
    if (videoGenerationId && videoStatus !== 'completed' && videoStatus !== 'failed') {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/video-status/${videoGenerationId}`);
          if (response.ok) {
            const data = await response.json();
            setVideoStatus(data.status);
            if (data.status === 'completed' && data.video_url) {
              setVideoUrl(data.video_url);
              setVideoLoading(false);
            } else if (data.status === 'failed') {
              setVideoError('Video generation failed. Please try again.');
              setVideoLoading(false);
            }
          }
        } catch (err) {
          console.error('Status check error:', err);
        }
      }, 5000); // Check every 5 seconds
    }
    return () => clearInterval(interval);
  }, [videoGenerationId, videoStatus]);

  // Generate AI Video
  const handleGenerateVideo = async () => {
    if (!topic) return;
    
    setVideoLoading(true);
    setVideoError(null);
    setVideoStatus('starting');
    
    try {
      const response = await fetch(`${API_BASE_URL}/generate-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic: topic,
          style: "professional",
          duration: 5
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to start video generation");
      }
      
      const data = await response.json();
      setVideoGenerationId(data.generation_id);
      setVideoStatus(data.status);
      
    } catch (err) {
      console.error("Video generation error:", err);
      setVideoError(err.message || "Failed to generate video");
      setVideoLoading(false);
    }
  };

  // Generate audio narration
  const handleGenerateAudio = async () => {
    if (!script) return;
    
    setAudioLoading(true);
    setAudioError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/generate-audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: script })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate audio");
      }
      
      const data = await response.json();
      setAudioData(data);
      
    } catch (err) {
      console.error("Audio generation error:", err);
      setAudioError(err.message || "Failed to generate audio");
    } finally {
      setAudioLoading(false);
    }
  };

  // Play/Pause audio
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle audio end
  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  return (
    <div className="video-placeholder">
      {/* Video Thumbnail Area with Animation or Actual Video */}
      <div className="video-thumbnail-container">
        {videoUrl ? (
          // Show actual generated video
          <video 
            controls 
            autoPlay
            style={{
              width: '100%',
              borderRadius: '12px',
              maxHeight: '400px',
              backgroundColor: '#000'
            }}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          // Show placeholder
          <div className="video-thumbnail animated-placeholder">
            {/* Animated gradient background */}
            <div className="animated-gradient"></div>
            
            {/* Placeholder content */}
            <div className="thumbnail-overlay">
              {/* Play button - starts audio if available, otherwise shows coming soon */}
              {audioData ? (
                <div 
                  className={`play-button-large ${isPlaying ? 'playing' : ''}`}
                  onClick={togglePlayPause}
                  style={{ cursor: 'pointer' }}
                >
                  <span>{isPlaying ? '⏸' : '▶'}</span>
                </div>
              ) : (
                <div className="play-button-large pulse-animation">
                  <span>▶</span>
                </div>
              )}
              
              {/* Status badge */}
              <div className="coming-soon-badge">
                <span className="badge-icon">
                  {videoLoading ? '⏳' : audioData ? '🔊' : '🎬'}
                </span>
                <span className="badge-text">
                  {videoLoading 
                    ? `Generating video... (${videoStatus || 'starting'})`
                    : audioData 
                      ? `Audio ready (${Math.round(audioData.duration_estimate)}s)` 
                      : 'Generate audio or video below'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden audio element */}
      {audioData && (
        <audio 
          ref={audioRef}
          src={`data:audio/mpeg;base64,${audioData.audio_base64}`}
          onEnded={handleAudioEnd}
        />
      )}

      {/* Video Info Below Thumbnail */}
      <div className="video-meta">
        <h3 className="video-title">{videoTitle}</h3>
        <span className="video-duration">
          {audioData ? `${Math.round(audioData.duration_estimate)}s` : '~1:45'}
        </span>
      </div>

      {/* Audio Generation Button */}
      {!audioData && (
        <button 
          className="audio-generate-btn"
          onClick={handleGenerateAudio}
          disabled={audioLoading || !script}
          style={{
            width: '100%',
            padding: '12px 20px',
            marginBottom: '10px',
            backgroundColor: audioLoading ? '#6b7280' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: audioLoading ? 'wait' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
        >
          {audioLoading ? (
            <>
              <span className="loading-spinner">⏳</span>
              Generating Audio...
            </>
          ) : (
            <>
              <span>🎧</span>
              Generate Audio Narration
            </>
          )}
        </button>
      )}

      {/* Audio Controls if audio is ready */}
      {audioData && (
        <div 
          className="audio-controls"
          style={{
            width: '100%',
            padding: '12px 20px',
            marginBottom: '10px',
            backgroundColor: '#10b981',
            color: 'white',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <button 
            onClick={togglePlayPause}
            style={{
              background: 'white',
              color: '#10b981',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <span style={{ fontWeight: '600' }}>
            {isPlaying ? '🔊 Playing audio...' : '🎧 Audio ready - Click to play'}
          </span>
        </div>
      )}

      {/* Audio Error */}
      {audioError && (
        <div 
          style={{
            padding: '10px',
            marginBottom: '10px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        >
          ⚠️ {audioError}
        </div>
      )}

      {/* Video Generation Button */}
      {!videoUrl && !videoLoading && (
        <button 
          onClick={handleGenerateVideo}
          disabled={!topic}
          style={{
            width: '100%',
            padding: '12px 20px',
            marginBottom: '10px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
        >
          <span>🎬</span>
          Generate AI Video (2-5 min)
        </button>
      )}

      {/* Video Generation Progress */}
      {videoLoading && (
        <div 
          style={{
            width: '100%',
            padding: '15px 20px',
            marginBottom: '10px',
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            borderRadius: '8px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎬</div>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            Generating AI Video...
          </div>
          <div style={{ fontSize: '13px', color: '#3b82f6' }}>
            Status: {videoStatus || 'Starting'} | This takes 2-5 minutes
          </div>
          <div 
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#93c5fd',
              borderRadius: '3px',
              marginTop: '10px',
              overflow: 'hidden'
            }}
          >
            <div 
              style={{
                width: videoStatus === 'generating' ? '60%' : '20%',
                height: '100%',
                backgroundColor: '#3b82f6',
                borderRadius: '3px',
                transition: 'width 1s ease',
                animation: 'pulse 2s infinite'
              }}
            />
          </div>
        </div>
      )}

      {/* Video Ready */}
      {videoUrl && (
        <div 
          style={{
            width: '100%',
            padding: '12px 20px',
            marginBottom: '10px',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: '600'
          }}
        >
          ✅ AI Video Generated Successfully!
        </div>
      )}

      {/* Video Error */}
      {videoError && (
        <div 
          style={{
            padding: '10px',
            marginBottom: '10px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        >
          ⚠️ {videoError}
        </div>
      )}

      {/* Script Preview Toggle */}
      <button 
        className="script-toggle"
        onClick={() => setShowScript(!showScript)}
      >
        {showScript ? "🔼 Hide Script" : "🔽 Read the Script"}
      </button>

      {/* Script Preview Panel */}
      {showScript && script && (
        <div className="script-preview">
          <div className="script-header">
            <span className="script-icon">📜</span>
            <span>Educational Script</span>
          </div>
          <div className="script-content">
            {script.split('\n').filter(p => p.trim()).map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
          <div className="script-footer">
            <span>🎧 Click "Generate Audio Narration" to listen!</span>
          </div>
        </div>
      )}
    </div>
  );
}
