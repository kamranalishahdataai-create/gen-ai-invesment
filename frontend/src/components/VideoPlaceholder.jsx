import { useState, useRef, useEffect } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function VideoPlaceholder({ script, topic }) {
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioData, setAudioData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const audioRef = useRef(null);

  const [videoLoading, setVideoLoading] = useState(false);
  const [videoGenerationId, setVideoGenerationId] = useState(null);
  const [videoStatus, setVideoStatus] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoError, setVideoError] = useState(null);

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
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [videoGenerationId, videoStatus]);

  const handleGenerateVideo = async () => {
    if (!topic) return;
    setVideoLoading(true);
    setVideoError(null);
    setVideoStatus('starting');
    try {
      const response = await fetch(`${API_BASE_URL}/generate-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, style: "professional", duration: 5 })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to start video generation");
      }
      const data = await response.json();
      setVideoGenerationId(data.generation_id);
      setVideoStatus(data.status);
    } catch (err) {
      setVideoError(err.message || "Failed to generate video");
      setVideoLoading(false);
    }
  };

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
      setAudioError(err.message || "Failed to generate audio");
    } finally {
      setAudioLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="video-section">
      <div className="video-placeholder">
        {videoUrl ? (
          <video controls autoPlay>
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            {videoLoading ? (
              <>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎬</div>
                <div>Generating video... ({videoStatus || 'starting'})</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.25rem' }}>This takes 2-5 minutes</div>
              </>
            ) : audioData ? (
              <div onClick={togglePlayPause} style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: '3rem' }}>{isPlaying ? '⏸' : '▶'}</div>
                <div style={{ marginTop: '0.5rem' }}>{isPlaying ? 'Playing audio...' : 'Click to play audio'}</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '3rem', opacity: 0.5 }}>▶</div>
                <div style={{ marginTop: '0.5rem', opacity: 0.7 }}>Generate audio or video below</div>
              </>
            )}
          </div>
        )}
      </div>

      {audioData && (
        <audio ref={audioRef} src={`data:audio/mpeg;base64,${audioData.audio_base64}`} onEnded={() => setIsPlaying(false)} />
      )}

      <div className="video-controls">
        {!audioData && (
          <button className="btn-video audio" onClick={handleGenerateAudio} disabled={audioLoading || !script}>
            {audioLoading ? <><span className="loading-spinner"></span>Generating...</> : '🎧 Generate Audio'}
          </button>
        )}
        {audioData && (
          <button className="btn-video audio" onClick={togglePlayPause}>
            {isPlaying ? '⏸ Pause' : '▶ Play Audio'}
          </button>
        )}
        {!videoUrl && !videoLoading && (
          <button className="btn-video generate" onClick={handleGenerateVideo} disabled={!topic}>
            🎬 Generate AI Video
          </button>
        )}
        {videoUrl && (
          <button className="btn-video generate" style={{ background: 'var(--green)' }}>
            ✅ Video Ready
          </button>
        )}
      </div>

      {audioError && <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#dc2626', borderRadius: '0.5rem', fontSize: '0.85rem', marginTop: '0.75rem' }}>⚠️ {audioError}</div>}
      {videoError && <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#dc2626', borderRadius: '0.5rem', fontSize: '0.85rem', marginTop: '0.75rem' }}>⚠️ {videoError}</div>}
    </div>
  );
}
