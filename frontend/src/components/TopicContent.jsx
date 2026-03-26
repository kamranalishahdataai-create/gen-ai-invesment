import { useState, useEffect } from "react";
import VideoPlaceholder from "./VideoPlaceholder";
import Takeaways from "./Takeaways";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function TopicContent({ topic, onBack }) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${API_BASE_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: `Explain ${topic} for beginners` }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error("Failed to fetch content");
      const data = await res.json();
      setContent(data);
    } catch (err) {
      if (err.name === 'AbortError') setError("Request timed out. Please try again.");
      else if (err.message.includes('Failed to fetch')) setError("Unable to connect. Backend may be offline.");
      else setError("Failed to load content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContent(); }, [topic]);

  return (
    <div className="topic-content">
      <button className="topic-back-btn" onClick={onBack}>← Back</button>
      <h2>{topic}</h2>

      {loading && (
        <div className="results-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading-spinner" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)', width: '32px', height: '32px', margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>AI is generating content...</p>
        </div>
      )}

      {error && (
        <div className="results-card">
          <p style={{ color: 'var(--red)' }}>⚠️ {error}</p>
          <button className="btn-wizard primary" onClick={fetchContent} style={{ marginTop: '1rem' }}>Try Again</button>
        </div>
      )}

      {content && (
        <>
          <VideoPlaceholder script={content.script} topic={topic} />

          <div className="results-card" style={{ marginTop: '1.5rem' }}>
            <h3>📄 Understanding {topic}</h3>
            <div className="results-text">
              {content.script && content.script.split('\n').filter(p => p.trim()).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          {content.key_takeaways && <Takeaways items={content.key_takeaways} />}

          {content.disclaimer && (
            <div style={{ padding: '1rem', background: 'var(--bg-gray)', borderRadius: 'var(--radius-lg)', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
              {content.disclaimer}
            </div>
          )}
        </>
      )}
    </div>
  );
}
