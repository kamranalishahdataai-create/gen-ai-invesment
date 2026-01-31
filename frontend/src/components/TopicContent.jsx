import { useState, useEffect } from "react";

/**
 * Topic Content Component
 * =======================
 * Displays educational content with video placeholder and article
 * 
 * Phase 2: Enhanced error handling and graceful degradation
 */

const API_BASE_URL = "http://127.0.0.1:8000";

export default function TopicContent({ topic, onBack }) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);

  // Fetch AI-generated content for the topic
  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(`${API_BASE_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: `Explain ${topic.title} for beginners` }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error("Failed to fetch content");
      }
      const data = await res.json();
      setContent(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError("Request timed out. Please try again.");
      } else if (err.message.includes('Failed to fetch')) {
        setError("Unable to connect. The backend server may be offline.");
      } else {
        setError("Failed to load content. Please try again.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch content on mount
  useEffect(() => {
    fetchContent();
  }, [topic.title]);

  return (
    <div className="topic-content">
      {/* Back Navigation */}
      <button className="back-button" onClick={onBack}>
        ← Back to {topic.section}
      </button>

      {/* Topic Header */}
      <div className="topic-header">
        <h1>{topic.title}</h1>
        <p className="topic-category">{topic.section} • {topic.subsection}</p>
      </div>

      {/* Video Section */}
      <div className="topic-video-section">
        <div className="video-container">
          <div className="video-placeholder animated-placeholder">
            <div className="animated-gradient"></div>
            <div className="play-button">▶</div>
            <div className="coming-soon-label">
              <span>🎬 Animated explainer coming soon</span>
            </div>
          </div>
        </div>
        <div className="video-info">
          <h3>Video Summary</h3>
          <p>Watch this AI-generated explainer to understand {topic.title.toLowerCase()} in simple terms.</p>
        </div>
      </div>

      {/* Article Section */}
      <div className="topic-article-section">
        <h2>📄 Understanding {topic.title}</h2>
        
        {loading && (
          <div className="content-loading">
            <div className="loading-spinner"></div>
            <p>AI is generating educational content...</p>
          </div>
        )}

        {error && (
          <div className="content-error">
            <p>{error}</p>
            <button onClick={fetchContent}>Try Again</button>
          </div>
        )}

        {content && (
          <div className="article-content">
            <div className="script-section">
              <p>{content.script}</p>
            </div>

            {content.key_takeaways && content.key_takeaways.length > 0 && (
              <div className="takeaways-section">
                <h3>🎯 Key Takeaways</h3>
                <ul>
                  {content.key_takeaways.map((takeaway, index) => (
                    <li key={index}>{takeaway}</li>
                  ))}
                </ul>
              </div>
            )}

            {content.disclaimer && (
              <div className="disclaimer-section">
                <p>{content.disclaimer}</p>
              </div>
            )}
          </div>
        )}

        {!content && !loading && !error && (
          <div className="static-content">
            <p>{topic.description || `Learn about ${topic.title.toLowerCase()} and how it affects your investment decisions.`}</p>
            <button className="generate-btn" onClick={fetchContent}>
              🤖 Generate AI Explanation
            </button>
          </div>
        )}
      </div>

      {/* Related Topics */}
      {topic.relatedTopics && topic.relatedTopics.length > 0 && (
        <div className="related-topics-section">
          <h3>📚 Related Topics</h3>
          <div className="related-topics-grid">
            {topic.relatedTopics.map((related, index) => (
              <div key={index} className="related-topic-card">
                <span>{related}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
