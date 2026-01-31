import { useState, useRef, useEffect } from "react";

/**
 * Investor Guide Categories for Dropdown
 */
const INVESTOR_GUIDE_CATEGORIES = [
  { id: "getting-started", title: "Getting Started", icon: "🚀" },
  { id: "stocks", title: "Stocks Investing", icon: "📈" },
  { id: "mutual-funds", title: "Mutual Fund Investing", icon: "📊" },
  { id: "commodities", title: "Commodity Investing", icon: "🥇" },
  { id: "alternates", title: "Alternate Investments", icon: "💎" },
  { id: "behavior", title: "Investing Behaviour", icon: "🧠" },
];

/**
 * Macroeconomy Categories for Dropdown
 */
const MACRO_CATEGORIES = [
  { id: "dashboard", title: "Macro Dashboard", icon: "📊" },
  { id: "inflation", title: "Inflation & Interest Rates", icon: "📈" },
  { id: "gdp", title: "GDP & Growth", icon: "🌍" },
  { id: "currency", title: "Currency & Trade", icon: "💱" },
  { id: "commodities", title: "Global Commodities", icon: "🛢️" },
  { id: "geopolitics", title: "Geopolitics & Markets", icon: "🌐" },
];

/**
 * Main Navigation Component
 * Provides top-level navigation with dropdown menus
 */
export default function Navigation({ activeSection, setActiveSection, onCategorySelect }) {
  const [investorDropdownOpen, setInvestorDropdownOpen] = useState(false);
  const [macroDropdownOpen, setMacroDropdownOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  
  const investorRef = useRef(null);
  const macroRef = useRef(null);
  const aboutRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (investorRef.current && !investorRef.current.contains(event.target)) {
        setInvestorDropdownOpen(false);
      }
      if (macroRef.current && !macroRef.current.contains(event.target)) {
        setMacroDropdownOpen(false);
      }
      if (aboutRef.current && !aboutRef.current.contains(event.target)) {
        setAboutDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryClick = (section, categoryId) => {
    setActiveSection(section);
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
    setInvestorDropdownOpen(false);
    setMacroDropdownOpen(false);
  };

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo" onClick={() => setActiveSection("home")}>
          <div className="logo-icon-wrapper">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#logoGradient)"/>
              <path d="M8 20L12 14L16 18L24 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="24" cy="10" r="2" fill="white"/>
              <defs>
                <linearGradient id="logoGradient" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#10b981"/>
                  <stop offset="1" stopColor="#059669"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="logo-text">FinAI Learn</span>
        </div>
        
        {/* Navigation Links with Dropdowns */}
        <div className="nav-links">
          {/* Investment Guide Dropdown */}
          <div className="nav-dropdown" ref={investorRef}>
            <button
              className={`nav-link ${activeSection === "investor-guide" ? "active" : ""}`}
              onClick={() => setInvestorDropdownOpen(!investorDropdownOpen)}
            >
              <span>Investment Guide</span>
              <svg className={`dropdown-arrow ${investorDropdownOpen ? "open" : ""}`} width="12" height="12" viewBox="0 0 12 12">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </button>
            
            {investorDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <span>📚 Explore Investment Topics</span>
                </div>
                {INVESTOR_GUIDE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className="dropdown-item"
                    onClick={() => handleCategoryClick("investor-guide", cat.id)}
                  >
                    <span className="dropdown-icon">{cat.icon}</span>
                    <span>{cat.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MacroEconomy Dropdown */}
          <div className="nav-dropdown" ref={macroRef}>
            <button
              className={`nav-link ${activeSection === "macroeconomy" ? "active" : ""}`}
              onClick={() => setMacroDropdownOpen(!macroDropdownOpen)}
            >
              <span>MacroEconomy</span>
              <svg className={`dropdown-arrow ${macroDropdownOpen ? "open" : ""}`} width="12" height="12" viewBox="0 0 12 12">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </button>
            
            {macroDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <span>🌍 Macro Indicators</span>
                </div>
                {MACRO_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className="dropdown-item"
                    onClick={() => handleCategoryClick("macroeconomy", cat.id)}
                  >
                    <span className="dropdown-icon">{cat.icon}</span>
                    <span>{cat.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* About Us Dropdown */}
          <div className="nav-dropdown" ref={aboutRef}>
            <button
              className="nav-link"
              onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
            >
              <span>About Us</span>
              <svg className={`dropdown-arrow ${aboutDropdownOpen ? "open" : ""}`} width="12" height="12" viewBox="0 0 12 12">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </button>
            
            {aboutDropdownOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item">
                  <span className="dropdown-icon">🎯</span>
                  <span>Our Mission</span>
                </button>
                <button className="dropdown-item">
                  <span className="dropdown-icon">👥</span>
                  <span>Team</span>
                </button>
                <button className="dropdown-item">
                  <span className="dropdown-icon">📞</span>
                  <span>Contact</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
          <span className="phase-badge">Phase 1</span>
          <button className="sign-in-btn">Sign In</button>
        </div>
      </div>
    </nav>
  );
}
