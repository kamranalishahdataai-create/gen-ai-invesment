import { useState, useEffect } from "react";
import TopicContent from "./TopicContent";

/**
 * Investor Guide Section
 * Contains 6 subsections: Getting Started, Stocks, Mutual Funds, Commodities, Alternates, Behavior
 */

// Define all topics for Investor Guide
const INVESTOR_GUIDE_DATA = {
  "getting-started": {
    title: "A. Getting Started",
    shortTitle: "Getting Started",
    icon: "🚀",
    description: "Foundation concepts for new investors",
    topics: [
      {
        id: "why-invest",
        title: "Why Invest at All?",
        description: "Understanding the importance of investing and how it helps grow your wealth over time.",
        hasVideo: true,
        thumbnail: "invest",
      },
      {
        id: "inflation-vs-savings",
        title: "Inflation vs Savings",
        description: "Learn why keeping money in savings alone may not be enough to beat inflation.",
        hasVideo: true,
        thumbnail: "inflation",
      },
      {
        id: "asset-classes",
        title: "Asset Classes Explained",
        description: "An overview of different investment options: stocks, bonds, real estate, gold, and more.",
        hasVideo: true,
        thumbnail: "assets",
      },
      {
        id: "risk-vs-return",
        title: "Risk vs Return",
        description: "Understanding the relationship between potential returns and investment risk.",
        hasVideo: true,
        thumbnail: "risk",
      },
    ],
  },
  "stocks": {
    title: "B. Stocks Investing",
    shortTitle: "Stocks Investing",
    icon: "📈",
    description: "Learn how to invest in the stock market",
    topics: [
      {
        id: "stocks-wealth",
        title: "How Stocks Create Wealth",
        description: "Understanding how owning stocks helps build long-term wealth.",
        hasVideo: true,
        thumbnail: "wealth",
      },
      {
        id: "fundamental-analysis",
        title: "Fundamental Analysis Basics",
        description: "Learn to analyze company financials and business fundamentals.",
        hasVideo: true,
        thumbnail: "analysis",
      },
      {
        id: "stock-selection",
        title: "Stock Selection Made Simple",
        description: "A beginner's guide to picking the right stocks.",
        hasVideo: true,
        thumbnail: "selection",
      },
      {
        id: "business-risk",
        title: "Business & Industry Risk Analysis",
        description: "Understanding sector and company-specific risks.",
        hasVideo: true,
        thumbnail: "business",
      },
      {
        id: "market-cycles",
        title: "Market Cycles & Stock Behaviour",
        description: "How stocks behave during different market phases.",
        hasVideo: false,
        thumbnail: "cycles",
      },
      {
        id: "stock-mistakes",
        title: "Common Stock Investing Mistakes",
        description: "Avoid these common pitfalls in stock investing.",
        hasVideo: false,
        thumbnail: "mistakes",
      },
    ],
  },
  "mutual-funds": {
    title: "C. Mutual Fund Investing",
    shortTitle: "Mutual Fund Investing",
    icon: "📊",
    description: "Everything about mutual fund investments",
    topics: [
      {
        id: "mf-basics",
        title: "What Are Mutual Funds & How They Work",
        description: "Understanding the basics of mutual fund investing.",
        hasVideo: true,
        thumbnail: "mf",
      },
      {
        id: "mf-types",
        title: "Types of Mutual Funds",
        description: "Equity, debt, hybrid, and other fund categories explained.",
        hasVideo: true,
        thumbnail: "types",
      },
      {
        id: "sip-vs-lumpsum",
        title: "SIP vs Lump Sum",
        description: "Comparing systematic investment vs one-time investment.",
        hasVideo: true,
        thumbnail: "sip",
      },
      {
        id: "choose-fund",
        title: "How to Choose the Right Fund",
        description: "Criteria for selecting mutual funds that match your goals.",
        hasVideo: true,
        thumbnail: "choose",
      },
      {
        id: "returns-risk-time",
        title: "Returns, Risk & Time Horizon",
        description: "Understanding how time affects mutual fund returns and risk.",
        hasVideo: false,
        thumbnail: "returns",
      },
      {
        id: "mf-taxes",
        title: "Taxes & Costs in Mutual Funds",
        description: "Understanding expense ratios, exit loads, and tax implications.",
        hasVideo: false,
        thumbnail: "taxes",
      },
    ],
  },
  "commodities": {
    title: "D. Commodity Investing",
    shortTitle: "Commodity Investing",
    icon: "🥇",
    description: "Investing in gold, silver, and other commodities",
    topics: [
      {
        id: "commodities-portfolio",
        title: "Why Commodities Matter in a Portfolio",
        description: "The role of commodities in portfolio diversification.",
        hasVideo: true,
        thumbnail: "portfolio",
      },
      {
        id: "gold-investment",
        title: "Gold as an Investment",
        description: "Understanding gold's role as a safe haven and inflation hedge.",
        hasVideo: true,
        thumbnail: "gold",
      },
      {
        id: "commodity-prices",
        title: "How Commodity Prices Move",
        description: "Factors affecting commodity prices and market dynamics.",
        hasVideo: true,
        thumbnail: "prices",
      },
      {
        id: "ways-to-invest",
        title: "Ways to Invest in Commodities",
        description: "ETFs, futures, physical ownership, and other methods.",
        hasVideo: false,
        thumbnail: "ways",
      },
      {
        id: "commodity-risks",
        title: "Risks in Commodity Investing",
        description: "Understanding volatility and risks in commodity markets.",
        hasVideo: false,
        thumbnail: "risks",
      },
      {
        id: "when-allocate",
        title: "When to Allocate to Commodities",
        description: "Strategic timing for commodity allocation.",
        hasVideo: false,
        thumbnail: "allocate",
      },
    ],
  },
  "alternates": {
    title: "E. Alternate Investments",
    shortTitle: "Alternate Investments",
    icon: "💎",
    description: "Beyond traditional investments",
    topics: [
      {
        id: "what-alternates",
        title: "What Are Alternate Investments",
        description: "Understanding investments beyond stocks and bonds.",
        hasVideo: true,
        thumbnail: "alternate",
      },
      {
        id: "pe-vc",
        title: "Private Equity & Venture Capital",
        description: "Investing in private companies and startups.",
        hasVideo: true,
        thumbnail: "pe",
      },
      {
        id: "reits-invits",
        title: "REITs & INVITs (Real Assets)",
        description: "Investing in real estate and infrastructure through trusts.",
        hasVideo: true,
        thumbnail: "reits",
      },
      {
        id: "hedge-funds",
        title: "Hedge Funds Explained",
        description: "How hedge funds work and their investment strategies.",
        hasVideo: false,
        thumbnail: "hedge",
      },
      {
        id: "when-alternates",
        title: "When (and When Not) to Consider Alternates",
        description: "Evaluating if alternate investments are right for you.",
        hasVideo: false,
        thumbnail: "when",
      },
    ],
  },
  "behavior": {
    title: "F. Investing Behaviour",
    shortTitle: "Investing Behaviour",
    icon: "🧠",
    description: "Psychology of investing",
    topics: [
      {
        id: "investor-panic",
        title: "Why Investors Panic",
        description: "Understanding the psychology behind market panic.",
        hasVideo: true,
        thumbnail: "panic",
      },
      {
        id: "loss-aversion",
        title: "Loss Aversion & Herd Behavior",
        description: "Common behavioral biases that hurt returns.",
        hasVideo: true,
        thumbnail: "loss",
      },
      {
        id: "recency-bias",
        title: "Recency Bias (with Indian Market Examples)",
        description: "How recent events disproportionately influence decisions.",
        hasVideo: true,
        thumbnail: "recency",
      },
      {
        id: "sip-behavior",
        title: "How SIP Helps Behaviorally",
        description: "The behavioral advantages of systematic investing.",
        hasVideo: false,
        thumbnail: "sipbehavior",
      },
    ],
  },
};

export default function InvestorGuide({ initialCategory }) {
  const [activeSubsection, setActiveSubsection] = useState(initialCategory || null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [videoPopup, setVideoPopup] = useState(null);
  const [filterDropdown, setFilterDropdown] = useState(false);

  // Update active subsection when initialCategory changes
  useEffect(() => {
    if (initialCategory) {
      setActiveSubsection(initialCategory);
    }
  }, [initialCategory]);

  // Handle topic selection
  const handleTopicClick = (subsectionKey, topic) => {
    setSelectedTopic({
      ...topic,
      section: "Investor Guide",
      subsection: INVESTOR_GUIDE_DATA[subsectionKey].title,
    });
  };

  // Handle back from topic
  const handleBack = () => {
    setSelectedTopic(null);
  };

  // Handle video click - open popup
  const handleVideoClick = (e, topic) => {
    e.stopPropagation();
    setVideoPopup(topic);
  };

  // Close video popup
  const closeVideoPopup = () => {
    setVideoPopup(null);
  };

  // If a topic is selected, show topic content
  if (selectedTopic) {
    return <TopicContent topic={selectedTopic} onBack={handleBack} />;
  }

  return (
    <div className="investor-guide">
      {/* Quote Banner */}
      <div className="quote-banner">
        <div className="quote-banner-content">
          <h2>" Simple Guide to Thinking like an Investor "</h2>
        </div>
      </div>

      {/* Filter and Category Navigation */}
      <div className="guide-navigation">
        {/* Filter Dropdown */}
        <div className="filter-section">
          <div className="filter-dropdown-wrapper">
            <button 
              className="filter-btn"
              onClick={() => setFilterDropdown(!filterDropdown)}
            >
              <span>Filter by</span>
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </button>
            {filterDropdown && (
              <div className="filter-menu">
                <button className="filter-item">All Topics</button>
                <button className="filter-item">With Video</button>
                <button className="filter-item">Articles Only</button>
              </div>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          {Object.entries(INVESTOR_GUIDE_DATA).map(([key, subsection]) => (
            <button
              key={key}
              className={`category-tab ${activeSubsection === key ? "active" : ""}`}
              onClick={() => setActiveSubsection(activeSubsection === key ? null : key)}
            >
              <span className="tab-icon">{subsection.icon}</span>
              <span className="tab-title">{subsection.shortTitle}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="guide-content">
        {!activeSubsection ? (
          // Show Getting Started by default
          <div className="topics-section">
            <div className="topics-header">
              <div className="section-title-with-dropdown">
                <h2>Getting Started</h2>
                <button className="dropdown-toggle">
                  <svg width="14" height="14" viewBox="0 0 14 14">
                    <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="video-cards-grid">
              {INVESTOR_GUIDE_DATA["getting-started"].topics.map((topic) => (
                <div key={topic.id} className="video-card">
                  <div 
                    className="video-card-thumbnail"
                    onClick={(e) => handleVideoClick(e, topic)}
                  >
                    <div className="thumbnail-placeholder">
                      <div className="thumbnail-content">
                        <span className="video-indicator">📹</span>
                        <p className="thumbnail-text">(will show video with first page as thumbnail)</p>
                      </div>
                    </div>
                    <div className="video-play-overlay">
                      <div className="mini-play-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                          <polygon points="8,5 19,12 8,19"/>
                        </svg>
                      </div>
                    </div>
                    <p className="popup-hint">(will open in popup window once clicked on video)</p>
                  </div>
                  <div className="video-card-content">
                    <h4>{topic.title}</h4>
                    <button 
                      className="learn-more-btn small"
                      onClick={() => handleTopicClick("getting-started", topic)}
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Show topics for selected subsection
          <div className="topics-section">
            <div className="topics-header">
              <button className="back-btn" onClick={() => setActiveSubsection(null)}>
                ← All Sections
              </button>
              <div className="section-title-with-dropdown">
                <h2>
                  {INVESTOR_GUIDE_DATA[activeSubsection].icon}{" "}
                  {INVESTOR_GUIDE_DATA[activeSubsection].shortTitle}
                </h2>
                <button className="dropdown-toggle">
                  <svg width="14" height="14" viewBox="0 0 14 14">
                    <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
              </div>
              <p>{INVESTOR_GUIDE_DATA[activeSubsection].description}</p>
            </div>

            <div className="video-cards-grid">
              {INVESTOR_GUIDE_DATA[activeSubsection].topics.map((topic) => (
                <div key={topic.id} className="video-card">
                  <div 
                    className="video-card-thumbnail"
                    onClick={(e) => topic.hasVideo && handleVideoClick(e, topic)}
                  >
                    <div className="thumbnail-placeholder">
                      <div className="thumbnail-content">
                        {topic.hasVideo ? (
                          <>
                            <span className="video-indicator">📹</span>
                            <p className="thumbnail-text">(will show video with first page as thumbnail)</p>
                          </>
                        ) : (
                          <>
                            <span className="video-indicator">📄</span>
                            <p className="thumbnail-text">Article Content</p>
                          </>
                        )}
                      </div>
                    </div>
                    {topic.hasVideo && (
                      <>
                        <div className="video-play-overlay">
                          <div className="mini-play-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                              <polygon points="8,5 19,12 8,19"/>
                            </svg>
                          </div>
                        </div>
                        <p className="popup-hint">(will open in popup window once clicked on video)</p>
                      </>
                    )}
                  </div>
                  <div className="video-card-content">
                    <h4>{topic.title}</h4>
                    <button 
                      className="learn-more-btn small"
                      onClick={() => handleTopicClick(activeSubsection, topic)}
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Note about videos */}
      <div className="videos-note">
        <p>Check the list of items for videos as shared earlier for each getting started, stock investing etc....some has four, some has more than four videos</p>
      </div>

      {/* Video Popup Modal */}
      {videoPopup && (
        <div className="video-popup-overlay" onClick={closeVideoPopup}>
          <div className="video-popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close-btn" onClick={closeVideoPopup}>×</button>
            <div className="popup-video-container">
              <div className="video-placeholder-popup">
                <div className="play-button">
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                    <polygon points="22,15 45,30 22,45" fill="white"/>
                  </svg>
                </div>
                <p>{videoPopup.title}</p>
                <span className="coming-soon">Video Coming Soon in Phase 2</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
