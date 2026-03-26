import { useState, useEffect } from "react";
import TopicContent from "./TopicContent";

/**
 * Macro Dashboard Component
 * Shows macroeconomic indicators for selected country
 */
function MacroDashboard() {
  const [selectedCountry, setSelectedCountry] = useState("india");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const countries = [
    { code: "india", name: "India", currency: "INR", flag: "🇮🇳" },
    { code: "usa", name: "United States", currency: "USD", flag: "🇺🇸" },
    { code: "uk", name: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
    { code: "eu", name: "European Union", currency: "EUR", flag: "🇪🇺" },
    { code: "japan", name: "Japan", currency: "JPY", flag: "🇯🇵" },
    { code: "china", name: "China", currency: "CNY", flag: "🇨🇳" },
  ];

  // Fetch macro data for selected country
  const fetchMacroData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/macro/${selectedCountry}`);
      if (!res.ok) throw new Error("Failed to fetch data");
      const responseData = await res.json();
      setData(responseData);
    } catch (err) {
      // Use mock data if API fails
      setData(getMockMacroData(selectedCountry));
    } finally {
      setLoading(false);
    }
  };

  // Mock data fallback
  const getMockMacroData = (country) => {
    const mockData = {
      india: {
        inflation: { value: "5.22%", trend: "down", change: "-0.3%" },
        policyRate: { value: "6.50%", trend: "stable", name: "Repo Rate" },
        gdpGrowth: { value: "7.8%", trend: "up", change: "+0.5%" },
        crudeOil: { value: "$82.45", trend: "up", change: "+2.1%" },
        currency: { value: "83.12", pair: "USD/INR", trend: "stable" },
        govtBorrowing: { value: "₹15.43L Cr", trend: "up", fiscalYear: "FY24" },
      },
      usa: {
        inflation: { value: "3.4%", trend: "down", change: "-0.2%" },
        policyRate: { value: "5.50%", trend: "stable", name: "Fed Funds Rate" },
        gdpGrowth: { value: "2.9%", trend: "up", change: "+0.3%" },
        crudeOil: { value: "$82.45", trend: "up", change: "+2.1%" },
        currency: { value: "1.00", pair: "USD Index", trend: "up" },
        govtBorrowing: { value: "$34.1T", trend: "up", fiscalYear: "2024" },
      },
      uk: {
        inflation: { value: "4.0%", trend: "down", change: "-0.6%" },
        policyRate: { value: "5.25%", trend: "stable", name: "Bank Rate" },
        gdpGrowth: { value: "0.6%", trend: "stable", change: "+0.1%" },
        crudeOil: { value: "$82.45", trend: "up", change: "+2.1%" },
        currency: { value: "0.79", pair: "USD/GBP", trend: "down" },
        govtBorrowing: { value: "£2.6T", trend: "up", fiscalYear: "2024" },
      },
      eu: {
        inflation: { value: "2.8%", trend: "down", change: "-0.4%" },
        policyRate: { value: "4.50%", trend: "stable", name: "ECB Rate" },
        gdpGrowth: { value: "0.5%", trend: "stable", change: "0%" },
        crudeOil: { value: "$82.45", trend: "up", change: "+2.1%" },
        currency: { value: "0.92", pair: "USD/EUR", trend: "stable" },
        govtBorrowing: { value: "€13.4T", trend: "up", fiscalYear: "2024" },
      },
      japan: {
        inflation: { value: "2.8%", trend: "up", change: "+0.2%" },
        policyRate: { value: "0.10%", trend: "up", name: "BOJ Rate" },
        gdpGrowth: { value: "1.9%", trend: "up", change: "+0.4%" },
        crudeOil: { value: "$82.45", trend: "up", change: "+2.1%" },
        currency: { value: "149.50", pair: "USD/JPY", trend: "up" },
        govtBorrowing: { value: "¥1,286T", trend: "up", fiscalYear: "2024" },
      },
      china: {
        inflation: { value: "0.2%", trend: "down", change: "-0.3%" },
        policyRate: { value: "3.45%", trend: "down", name: "LPR" },
        gdpGrowth: { value: "5.2%", trend: "down", change: "-0.3%" },
        crudeOil: { value: "$82.45", trend: "up", change: "+2.1%" },
        currency: { value: "7.24", pair: "USD/CNY", trend: "up" },
        govtBorrowing: { value: "¥30T", trend: "up", fiscalYear: "2024" },
      },
    };
    return mockData[country] || mockData.india;
  };

  useEffect(() => {
    fetchMacroData();
  }, [selectedCountry]);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up": return "📈";
      case "down": return "📉";
      default: return "➡️";
    }
  };

  const getTrendClass = (trend) => {
    switch (trend) {
      case "up": return "trend-up";
      case "down": return "trend-down";
      default: return "trend-stable";
    }
  };

  return (
    <div className="macro-dashboard">
      <div className="dashboard-header">
        <h2>📊 Macro Dashboard</h2>
        <p>Real-time macroeconomic indicators</p>
      </div>

      {/* Country Selector */}
      <div className="country-selector">
        <label>Select Country:</label>
        <div className="country-buttons">
          {countries.map((country) => (
            <button
              key={country.code}
              className={`country-btn ${selectedCountry === country.code ? "active" : ""}`}
              onClick={() => setSelectedCountry(country.code)}
            >
              <span className="country-flag">{country.flag}</span>
              <span className="country-name">{country.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Grid */}
      {loading ? (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading macro data...</p>
        </div>
      ) : data ? (
        <div className="indicators-grid">
          <div className={`indicator-card ${getTrendClass(data.inflation.trend)}`}>
            <div className="indicator-header">
              <span className="indicator-icon">💹</span>
              <span className="indicator-name">Inflation (CPI)</span>
            </div>
            <div className="indicator-value">{data.inflation.value}</div>
            <div className="indicator-trend">
              {getTrendIcon(data.inflation.trend)} {data.inflation.change}
            </div>
          </div>

          <div className={`indicator-card ${getTrendClass(data.policyRate.trend)}`}>
            <div className="indicator-header">
              <span className="indicator-icon">🏦</span>
              <span className="indicator-name">{data.policyRate.name}</span>
            </div>
            <div className="indicator-value">{data.policyRate.value}</div>
            <div className="indicator-trend">
              {getTrendIcon(data.policyRate.trend)} Policy Rate
            </div>
          </div>

          <div className={`indicator-card ${getTrendClass(data.gdpGrowth.trend)}`}>
            <div className="indicator-header">
              <span className="indicator-icon">📊</span>
              <span className="indicator-name">GDP Growth</span>
            </div>
            <div className="indicator-value">{data.gdpGrowth.value}</div>
            <div className="indicator-trend">
              {getTrendIcon(data.gdpGrowth.trend)} {data.gdpGrowth.change}
            </div>
          </div>

          <div className={`indicator-card ${getTrendClass(data.crudeOil.trend)}`}>
            <div className="indicator-header">
              <span className="indicator-icon">🛢️</span>
              <span className="indicator-name">Crude Oil (Brent)</span>
            </div>
            <div className="indicator-value">{data.crudeOil.value}</div>
            <div className="indicator-trend">
              {getTrendIcon(data.crudeOil.trend)} {data.crudeOil.change}
            </div>
          </div>

          <div className={`indicator-card ${getTrendClass(data.currency.trend)}`}>
            <div className="indicator-header">
              <span className="indicator-icon">💱</span>
              <span className="indicator-name">{data.currency.pair}</span>
            </div>
            <div className="indicator-value">{data.currency.value}</div>
            <div className="indicator-trend">
              {getTrendIcon(data.currency.trend)} Exchange Rate
            </div>
          </div>

          <div className={`indicator-card ${getTrendClass(data.govtBorrowing.trend)}`}>
            <div className="indicator-header">
              <span className="indicator-icon">📋</span>
              <span className="indicator-name">Govt Borrowing</span>
            </div>
            <div className="indicator-value">{data.govtBorrowing.value}</div>
            <div className="indicator-trend">
              {data.govtBorrowing.fiscalYear}
            </div>
          </div>
        </div>
      ) : null}

      <p className="data-disclaimer">
        * Data shown is for educational purposes. For real-time data, please refer to official sources.
      </p>
    </div>
  );
}

/**
 * Macroeconomy Section
 * Contains 5 subsections: Macro 101, Dashboard, Indicator Impact, Events, Global Macro
 */

const MACRO_DATA = {
  "macro-101": {
    title: "A. Macro 101 (Basics)",
    icon: "📖",
    description: "Fundamental macroeconomic concepts",
    component: null,
    topics: [
      {
        id: "gdp",
        title: "GDP: What It Actually Means",
        description: "Understanding Gross Domestic Product and its significance.",
        hasVideo: true,
      },
      {
        id: "inflation-cpi",
        title: "Inflation & CPI",
        description: "How inflation is measured and why it matters to investors.",
        hasVideo: true,
      },
      {
        id: "interest-rates",
        title: "Interest Rates & Repo Rate",
        description: "How central banks use interest rates to control the economy.",
        hasVideo: true,
      },
      {
        id: "fiscal-monetary",
        title: "Fiscal vs Monetary Policy",
        description: "Understanding government and central bank economic tools.",
        hasVideo: false,
      },
      {
        id: "business-cycles",
        title: "Business Cycles",
        description: "The natural rhythm of economic expansion and contraction.",
        hasVideo: false,
      },
    ],
  },
  "dashboard": {
    title: "B. Macro Dashboard",
    icon: "📊",
    description: "Live macroeconomic indicators by country",
    component: "dashboard",
    topics: [],
  },
  "indicator-impact": {
    title: "C. Macro Indicator Impact",
    icon: "🎯",
    description: "How macro indicators affect investments",
    component: null,
    topics: [
      {
        id: "inflation-impact",
        title: "Inflation Impact on Investments",
        description: "How inflation affects different asset classes.",
        hasVideo: true,
      },
      {
        id: "interest-equity-debt",
        title: "Interest Rate Impact on Equity vs Debt",
        description: "Understanding rate sensitivity across asset classes.",
        hasVideo: true,
      },
      {
        id: "crude-oil-impact",
        title: "Crude Oil Impact on Economy",
        description: "How oil prices ripple through the economy.",
        hasVideo: true,
      },
      {
        id: "currency-impact",
        title: "Relative Currency Impact",
        description: "How currency movements affect investments.",
        hasVideo: false,
      },
    ],
  },
  "macro-events": {
    title: "D. Macro Events",
    icon: "📰",
    description: "Current macroeconomy news and analysis",
    component: null,
    topics: [
      {
        id: "rbi-rates",
        title: "Why RBI Paused Rates",
        description: "Analysis of RBI's monetary policy decisions.",
        hasVideo: true,
      },
      {
        id: "markets-gdp",
        title: "Why Markets Fell Despite Good GDP",
        description: "Understanding market reactions to economic data.",
        hasVideo: true,
      },
      {
        id: "fed-india",
        title: "How US Fed Impacts Indian Markets",
        description: "The global interconnection of monetary policies.",
        hasVideo: true,
      },
    ],
  },
  "global-macro": {
    title: "E. Global Macro",
    icon: "🌐",
    description: "Global macroeconomic trends",
    component: null,
    topics: [
      {
        id: "us-fed",
        title: "US Fed Policy",
        description: "Understanding Federal Reserve decisions and their global impact.",
        hasVideo: true,
      },
      {
        id: "china-slowdown",
        title: "China Slowdown",
        description: "Analyzing China's economic challenges and implications.",
        hasVideo: true,
      },
      {
        id: "geopolitical-risk",
        title: "Geopolitical Risk",
        description: "How political events affect global markets.",
        hasVideo: false,
      },
      {
        id: "commodity-cycles",
        title: "Commodity Cycles",
        description: "Understanding long-term commodity price patterns.",
        hasVideo: false,
      },
    ],
  },
};

export default function Macroeconomy() {
  const [activeSubsection, setActiveSubsection] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Handle topic selection
  const handleTopicClick = (subsectionKey, topic) => {
    setSelectedTopic({
      ...topic,
      section: "Macroeconomy",
      subsection: MACRO_DATA[subsectionKey].title,
    });
  };

  // Handle back from topic
  const handleBack = () => {
    setSelectedTopic(null);
  };

  // If a topic is selected, show topic content
  if (selectedTopic) {
    return <TopicContent topic={selectedTopic} onBack={handleBack} />;
  }

  return (
    <div className="macroeconomy">
      {/* Section Header */}
      <div className="section-header">
        <h1>🌍 Macroeconomy</h1>
        <p>Understand how the economy affects your investments</p>
      </div>

      {/* Subsection Navigation */}
      <div className="subsection-nav">
        {Object.entries(MACRO_DATA).map(([key, subsection]) => (
          <button
            key={key}
            className={`subsection-tab ${activeSubsection === key ? "active" : ""}`}
            onClick={() => setActiveSubsection(activeSubsection === key ? null : key)}
          >
            <span className="subsection-icon">{subsection.icon}</span>
            <span className="subsection-title">{subsection.title}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="macro-content">
        {!activeSubsection ? (
          // Show all subsections overview
          <div className="subsections-grid">
            {Object.entries(MACRO_DATA).map(([key, subsection]) => (
              <div
                key={key}
                className="subsection-card"
                onClick={() => setActiveSubsection(key)}
              >
                <div className="card-icon">{subsection.icon}</div>
                <h3>{subsection.title}</h3>
                <p>{subsection.description}</p>
                {subsection.component === "dashboard" ? (
                  <span className="topic-count">📊 Live Dashboard</span>
                ) : (
                  <span className="topic-count">{subsection.topics.length} topics</span>
                )}
              </div>
            ))}
          </div>
        ) : activeSubsection === "dashboard" ? (
          // Show Macro Dashboard
          <div className="dashboard-section">
            <button className="back-btn" onClick={() => setActiveSubsection(null)}>
              ← All Sections
            </button>
            <MacroDashboard />
          </div>
        ) : (
          // Show topics for selected subsection
          <div className="topics-section">
            <div className="topics-header">
              <button className="back-btn" onClick={() => setActiveSubsection(null)}>
                ← All Sections
              </button>
              <h2>
                {MACRO_DATA[activeSubsection].icon}{" "}
                {MACRO_DATA[activeSubsection].title}
              </h2>
              <p>{MACRO_DATA[activeSubsection].description}</p>
            </div>

            <div className="topics-grid">
              {MACRO_DATA[activeSubsection].topics.map((topic) => (
                <div
                  key={topic.id}
                  className={`topic-card ${topic.hasVideo ? "has-video" : ""}`}
                  onClick={() => handleTopicClick(activeSubsection, topic)}
                >
                  {topic.hasVideo && <span className="video-badge">🎬 Video</span>}
                  <h4>{topic.title}</h4>
                  <p>{topic.description}</p>
                  <span className="learn-more">Learn More →</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
