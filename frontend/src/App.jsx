import { useState } from "react";
import Navigation from "./components/Navigation";
import QuestionBox from "./components/QuestionBox";
import VideoPlaceholder from "./components/VideoPlaceholder";
import Takeaways from "./components/Takeaways";
import RelatedQuestions from "./components/RelatedQuestions";
import MarketPanel from "./components/MarketPanel";
import InvestorGuide from "./components/InvestorGuide";
import Macroeconomy from "./components/Macroeconomy";
import "./index.css";

/**
 * GenAI Investment Learning Platform - Main Application
 * =====================================================
 * Phase 2: Enhanced with safety layer and real market data
 * 
 * Sections:
 * 1. Home - Smart search using GenAI
 * 2. Investor Guide - Educational content for investors
 * 3. Macroeconomy - Macro indicators and analysis
 * 
 * Features:
 * - Educational-only content (no investment advice)
 * - Graceful error handling
 * - Backend failure resilience
 */

const API_BASE_URL = "http://127.0.0.1:8000";

export default function App() {
  // Active section state
  const [activeSection, setActiveSection] = useState("home");
  
  // Category selection for Investor Guide
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Main response data from backend
  const [data, setData] = useState(null);
  // Loading state for better UX
  const [loading, setLoading] = useState(false);
  // Error state for handling API failures
  const [error, setError] = useState(null);
  // Video popup state
  const [videoPopupOpen, setVideoPopupOpen] = useState(false);

  /**
   * Handle clicking a related question
   * Triggers a new query with the selected question
   */
  const handleRelatedQuestionClick = async (question) => {
    if (!question) return;
    
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(`${API_BASE_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("Failed to fetch response");
      const responseData = await res.json();
      setData(responseData);
      
      // Scroll to top of results
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } catch (err) {
      if (err.name === 'AbortError') {
        setError("Request timed out. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle category selection from navigation
   */
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  /**
   * Clear current data and error state
   */
  const handleClearResults = () => {
    setData(null);
    setError(null);
  };

  /**
   * Render Home Section - Smart Search with GenAI
   */
  const renderHomeSection = () => (
    <>
      {/* Hero Section with Gradient Background */}
      <section className="hero-banner">
        <div className="hero-banner-content">
          <h1 className="hero-title">Learn Investing the Easy Way. Build Wealth the Right Way!</h1>
          <p className="hero-subtitle">Simple, AI powered Investment Learning to build Confidence in Investment World</p>
          
          {/* Search Input */}
          <div className="hero-search-container">
            <div className="hero-search-box">
              <span className="search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              </span>
              <QuestionBox 
                setData={setData} 
                setLoading={setLoading} 
                setError={setError}
                placeholder="Write your Investment Query Here"
                buttonText="Learn"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Introductory Video Section */}
      <section className="intro-video-section">
        <div className="intro-video-container">
          <div className="intro-video-wrapper" onClick={() => setVideoPopupOpen(true)}>
            <div className="intro-video-thumbnail">
              <div className="video-grid-overlay">
                {/* Grid of placeholder images */}
                <div className="grid-item"></div>
                <div className="grid-item"></div>
                <div className="grid-item"></div>
                <div className="grid-item"></div>
                <div className="grid-item"></div>
                <div className="grid-item"></div>
              </div>
              <div className="intro-play-button">
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
                  <polygon points="18,12 38,25 18,38" fill="currentColor"/>
                </svg>
              </div>
              <div className="intro-video-label">Initial Introductory Video</div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>AI is generating your educational content...</p>
          <span className="loading-subtext">This may take a few seconds</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p className="error-message">{error}</p>
          <p className="error-hint">
            {error.includes('connect') 
              ? 'Make sure the backend server is running on port 8000.' 
              : 'Please try again with a different question.'}
          </p>
          <button onClick={() => setError(null)} className="dismiss-btn">
            Dismiss
          </button>
        </div>
      )}

      {/* Results Section - Only show when data is available and not loading */}
      {data && !loading && (
        <div className="results-container">
          {/* Back/Clear Button */}
          <button className="back-to-search-btn" onClick={handleClearResults}>
            ← Ask another question
          </button>

          {/* AI Response Header */}
          <div className="ai-response-header">
            <span className="ai-response-badge">AI RESPONSE</span>
            <h1 className="response-topic-title">{data.topic}</h1>
            {data.intent === "advisory" && (
              <div className="advisory-notice">
                <span className="notice-icon">💡</span>
                <span>We've converted your question into educational content.</span>
              </div>
            )}
          </div>

          {/* Main Content: Video + Takeaways Side by Side */}
          <div className="video-takeaways-row">
            {/* Video Section - Left Side */}
            <div className="video-column">
              <VideoPlaceholder script={data.script} topic={data.topic} />
              
              {/* Video Info */}
              <div className="video-info-bar">
                <span className="video-info-title">{data.topic} Explained</span>
                <span className="video-info-duration">1:45</span>
              </div>
              
              {/* Learn More Button */}
              <button className="learn-more-btn primary">
                Learn More
              </button>
            </div>

            {/* Key Takeaways - Right Side */}
            <div className="takeaways-column">
              <div className="takeaways-panel">
                <h3 className="takeaways-title">✨ Key Takeaways</h3>
                <Takeaways items={data.key_takeaways} />
              </div>
            </div>
          </div>

          {/* RECOMMENDED NEXT STEPS Section */}
          <section className="recommended-next-steps">
            <h2 className="section-heading">RECOMMENDED</h2>
            <div className="next-steps-grid">
              {/* Next Logical Question */}
              <div className="next-step-card">
                <div className="card-header">
                  <span className="card-icon">🔄</span>
                  <span className="card-label">NEXT LOGICAL QUESTION</span>
                </div>
                <p className="card-content">
                  {data.related_questions && data.related_questions[0] 
                    ? data.related_questions[0] 
                    : "What factors should I consider next?"}
                </p>
                <button 
                  className="explore-btn"
                  onClick={() => data.related_questions && handleRelatedQuestionClick(data.related_questions[0])}
                >
                  Explore →
                </button>
              </div>

              {/* People Also Asked */}
              <div className="next-step-card">
                <div className="card-header">
                  <span className="card-icon">👥</span>
                  <span className="card-label">PEOPLE ALSO ASKED</span>
                </div>
                <p className="card-content">
                  {data.related_questions && data.related_questions[1] 
                    ? data.related_questions[1] 
                    : "What are the common misconceptions?"}
                </p>
                <button 
                  className="explore-btn"
                  onClick={() => data.related_questions && handleRelatedQuestionClick(data.related_questions[1])}
                >
                  Explore →
                </button>
              </div>

              {/* Related Tool */}
              <div className="next-step-card">
                <div className="card-header">
                  <span className="card-icon">🔧</span>
                  <span className="card-label">RELATED TOOL</span>
                </div>
                <p className="card-content">
                  Calculator: Estimate returns and growth projections.
                </p>
                <button className="explore-btn tool-btn">
                  Open Tool →
                </button>
              </div>
            </div>
          </section>

          {/* Market Data Section - Only show if market data exists */}
          {data.market_data && (
            <section className="section market-section">
              <h2>📊 Market Snapshot</h2>
              <MarketPanel 
                marketData={data.market_data} 
                comparison={data.comparison}
              />
            </section>
          )}

          {/* Disclaimer */}
          <div className="disclaimer">
            <span className="disclaimer-icon">⚠️</span>
            <p>{data.disclaimer}</p>
          </div>
        </div>
      )}

      {/* Here How You Learn Section */}
      {!data && !loading && (
        <>
          <section className="how-you-learn-section">
            <h2 className="section-title-centered">
              <span>Here How You Learn</span>
            </h2>
            <div className="learning-cards-grid">
              <div className="learning-card" onClick={() => setActiveSection("investor-guide")}>
                <div className="learning-card-icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="8" y="6" width="32" height="36" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M14 14h20M14 22h20M14 30h12" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="36" cy="14" r="4" fill="#10b981"/>
                  </svg>
                </div>
                <h3>Stock & MF Investing</h3>
                <p>Learn to Invest in Stocks & Mutual Funds with Confidence. Learn to Evaluate and Analyze Stocks before investing.</p>
              </div>

              <div className="learning-card">
                <div className="learning-card-icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="8" y="12" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <rect x="14" y="18" width="8" height="12" stroke="currentColor" strokeWidth="2"/>
                    <rect x="26" y="18" width="8" height="12" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 8h32M8 40h32" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3>Commodity Investing</h3>
                <p>Learn about Gold, Silver, Oil and other commodities. Understand how to include them in your portfolio.</p>
              </div>

              <div className="learning-card" onClick={() => setActiveSection("macroeconomy")}>
                <div className="learning-card-icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2"/>
                    <path d="M24 8v32M8 24h32" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 12l24 24M36 12L12 36" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                </div>
                <h3>Macroeconomy</h3>
                <p>Understand how economy affects your investments. Learn about GDP, Inflation, Interest Rates and more.</p>
              </div>
            </div>
          </section>

          {/* Explore More Section */}
          <section className="explore-more-section">
            <h2 className="section-title-centered">
              <span>Explore More</span>
            </h2>
            <div className="explore-cards-container">
              <div className="explore-card" onClick={() => setActiveSection("investor-guide")}>
                <div className="explore-card-icon">📚</div>
                <h3>Investor Guide</h3>
                <p>Complete guide from basics to advanced investing strategies</p>
                <span className="explore-link">Explore →</span>
              </div>
              <div className="explore-card" onClick={() => setActiveSection("macroeconomy")}>
                <div className="explore-card-icon">🌍</div>
                <h3>Macroeconomy</h3>
                <p>Understand how the economy affects your investments</p>
                <span className="explore-link">Explore →</span>
              </div>
            </div>
          </section>

          {/* Here's How We Help You Section */}
          <section className="how-we-help-section">
            <h2 className="section-title-centered">
              <span>Here's How We Help You</span>
            </h2>
            <div className="help-cards-grid">
              <div className="help-card">
                <div className="help-card-icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="8" y="10" width="32" height="28" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M14 24h8M14 30h12" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="32" cy="18" r="6" stroke="#10b981" strokeWidth="2"/>
                    <path d="M29 18h6M32 15v6" stroke="#10b981" strokeWidth="2"/>
                  </svg>
                </div>
                <h3>Stock Market Investing</h3>
                <p><strong>Strengthen your Fundamentals</strong> with our Courses, <strong>Execute what you learned</strong> with our Community.</p>
              </div>

              <div className="help-card">
                <div className="help-card-icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="8" y="16" width="32" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <rect x="12" y="12" width="24" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 24h16M16 30h8" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3>Real Estate Investing</h3>
                <p>Discover <strong>Lucrative Properties</strong>, Navigate Complex <strong>Global Markets</strong> with Confidence, and Strategically <strong>Maximize Your Investment Yield</strong>.</p>
              </div>

              <div className="help-card">
                <div className="help-card-icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path d="M8 38V16l16-8 16 8v22" stroke="currentColor" strokeWidth="2"/>
                    <rect x="18" y="26" width="12" height="12" stroke="currentColor" strokeWidth="2"/>
                    <path d="M24 8v10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3>Career Building</h3>
                <p>Build <strong>Practical skills</strong> that are critical to building a career in <strong>Top fields like Management Consulting</strong>.</p>
              </div>
            </div>
            <div className="help-section-cta">
              <button className="learn-more-btn" onClick={() => setActiveSection("investor-guide")}>
                Learn More
              </button>
            </div>
          </section>
        </>
      )}

      {/* Video Popup Modal */}
      {videoPopupOpen && (
        <div className="video-popup-overlay" onClick={() => setVideoPopupOpen(false)}>
          <div className="video-popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close-btn" onClick={() => setVideoPopupOpen(false)}>×</button>
            <div className="popup-video-container">
              <div className="video-placeholder-popup">
                <div className="play-button">
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                    <polygon points="22,15 45,30 22,45" fill="white"/>
                  </svg>
                </div>
                <p>Introductory Video - Coming Soon in Phase 2</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  /**
   * Render content based on active section
   */
  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return renderHomeSection();
      case "investor-guide":
        return <InvestorGuide initialCategory={selectedCategory} />;
      case "macroeconomy":
        return <Macroeconomy />;
      default:
        return renderHomeSection();
    }
  };

  return (
    <div className="app-container">
      {/* Navigation */}
      <Navigation 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        onCategorySelect={handleCategorySelect}
      />

      {/* Main Content */}
      <main className="main-content">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-column">
            <h4>Features</h4>
            <ul>
              <li>Script to Video</li>
              <li>Investor Guide</li>
              <li>Edit Video Using Text</li>
              <li>Create Video Highlights</li>
              <li>Auto Caption Videos</li>
              <li>Auto Summarize Long Videos</li>
              <li>API Access</li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Resources</h4>
            <ul>
              <li>Help Center</li>
              <li>Pictory Reviews</li>
              <li>Why FinLearnAI</li>
            </ul>
          </div>
          <div className="footer-column footer-video">
            <div className="footer-video-placeholder"></div>
          </div>
          <div className="footer-column">
            <h4>Popular Features</h4>
            <div className="footer-video-placeholder large"></div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>FinAI Learn • GenAI Investment Learning Platform</p>
          <p className="footer-note">
            🔮 Coming in Phase 2: AI-generated videos, real-time market data, personalized learning paths
          </p>
        </div>
      </footer>
    </div>
  );
}
