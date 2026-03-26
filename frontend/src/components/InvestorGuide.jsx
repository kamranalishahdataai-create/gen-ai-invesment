import { useState } from 'react';

const TABS = [
  { id: 'getting-started', label: 'Getting Started', icon: '🚀' },
  { id: 'stocks', label: 'Stocks & Equities', icon: '📈' },
  { id: 'mutual-funds', label: 'Mutual Funds', icon: '📊' },
  { id: 'commodities', label: 'Commodities', icon: '🥇' },
  { id: 'alternates', label: 'Alternate Investments', icon: '💎' },
  { id: 'behavior', label: 'Behavioral Finance', icon: '🧠' },
];

const TOPICS_DATA = {
  'getting-started': [
    { title: 'What is Investing?', desc: 'Learn the basics of putting your money to work.', icon: '💰' },
    { title: 'Types of Investments', desc: 'Stocks, bonds, mutual funds and more explained.', icon: '📋' },
    { title: 'Risk vs Return', desc: 'Understanding the fundamental trade-off in investing.', icon: '⚖️' },
    { title: 'Setting Financial Goals', desc: 'How to define and plan for your financial objectives.', icon: '🎯' },
    { title: 'Power of Compounding', desc: 'Why starting early makes a massive difference.', icon: '📈' },
    { title: 'Building Your First Portfolio', desc: 'A step-by-step guide for beginners.', icon: '🧱' },
  ],
  stocks: [
    { title: 'Stock Market Basics', desc: 'How the stock market works and key terminology.', icon: '📊' },
    { title: 'Fundamental Analysis', desc: 'Evaluating companies using financial statements.', icon: '🔍' },
    { title: 'Technical Analysis', desc: 'Reading charts and identifying patterns.', icon: '📉' },
    { title: 'IPO Investing', desc: 'How to invest in Initial Public Offerings.', icon: '🆕' },
    { title: 'Dividend Investing', desc: 'Building passive income through dividends.', icon: '💵' },
    { title: 'Blue Chip vs Small Cap', desc: 'Comparing different market cap segments.', icon: '🏢' },
  ],
  'mutual-funds': [
    { title: 'What are Mutual Funds?', desc: 'Pooled investments managed by professionals.', icon: '🏦' },
    { title: 'Types of Mutual Funds', desc: 'Equity, debt, hybrid, and index funds explained.', icon: '📑' },
    { title: 'SIP vs Lump Sum', desc: 'Which investment approach is right for you?', icon: '🔄' },
    { title: 'NAV Explained', desc: 'Understanding Net Asset Value and fund pricing.', icon: '🧮' },
    { title: 'Expense Ratios', desc: 'How fund costs affect your long-term returns.', icon: '💸' },
    { title: 'Tax-Saving Funds (ELSS)', desc: 'Save taxes while building wealth.', icon: '🏛️' },
  ],
  commodities: [
    { title: 'Gold Investment', desc: 'Physical gold, Gold ETFs, and Sovereign Gold Bonds.', icon: '🥇' },
    { title: 'Silver Markets', desc: 'Industrial and investment demand for silver.', icon: '🥈' },
    { title: 'Crude Oil Trading', desc: 'How oil prices affect the economy and markets.', icon: '🛢️' },
    { title: 'Agricultural Commodities', desc: 'Investing in grains, cotton, and spices.', icon: '🌾' },
    { title: 'Commodity Futures', desc: 'Understanding futures contracts and trading.', icon: '📜' },
    { title: 'Commodity ETFs', desc: 'Easy access to commodity markets through ETFs.', icon: '📊' },
  ],
  alternates: [
    { title: 'Real Estate (REITs)', desc: 'Invest in property without buying physical real estate.', icon: '🏠' },
    { title: 'Cryptocurrency Basics', desc: 'Bitcoin, Ethereum, and the world of digital assets.', icon: '₿' },
    { title: 'P2P Lending', desc: 'Earn interest by lending directly to borrowers.', icon: '🤝' },
    { title: 'Startup Investing', desc: 'Angel investing and venture capital for individuals.', icon: '🚀' },
    { title: 'Art & Collectibles', desc: 'Alternative assets for portfolio diversification.', icon: '🎨' },
    { title: 'International Investing', desc: 'Accessing global markets from India.', icon: '🌍' },
  ],
  behavior: [
    { title: 'Common Biases', desc: 'Cognitive biases that hurt your investment decisions.', icon: '🧠' },
    { title: 'Fear & Greed', desc: 'How emotions drive market cycles and volatility.', icon: '😰' },
    { title: 'Herd Mentality', desc: 'Why following the crowd often leads to losses.', icon: '🐑' },
    { title: 'Loss Aversion', desc: 'Why losses feel twice as painful as equivalent gains.', icon: '📉' },
    { title: 'Overconfidence', desc: 'The danger of overestimating your investment skills.', icon: '🎭' },
    { title: 'Disciplined Investing', desc: 'Building habits that lead to long-term success.', icon: '🎯' },
  ],
};

export default function InvestorGuide({ initialCategory, onSelectTopic }) {
  const [activeTab, setActiveTab] = useState(initialCategory || 'getting-started');
  const topics = TOPICS_DATA[activeTab] || [];

  return (
    <div className="investor-guide">
      <div className="investor-guide-header">
        <h2>Investor Guide</h2>
        <p>Comprehensive learning resources for every type of investor</p>
      </div>

      <div className="guide-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`guide-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="guide-topics-grid">
        {topics.map((topic, i) => (
          <div
            key={i}
            className="guide-topic-card"
            onClick={() => onSelectTopic && onSelectTopic(topic.title, activeTab)}
          >
            <div className="topic-icon">{topic.icon}</div>
            <h4>{topic.title}</h4>
            <p>{topic.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
