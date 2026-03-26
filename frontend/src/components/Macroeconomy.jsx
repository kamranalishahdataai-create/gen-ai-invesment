import { useState, useEffect } from 'react';

const API_BASE_URL = "http://127.0.0.1:8000";

const COUNTRIES = [
  { id: 'usa', name: 'United States', flag: '🇺🇸' },
  { id: 'india', name: 'India', flag: '🇮🇳' },
  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
  { id: 'eu', name: 'European Union', flag: '🇪🇺' },
  { id: 'japan', name: 'Japan', flag: '🇯🇵' },
];

const INDICATORS = {
  usa: [
    { name: 'Interest Rate', desc: 'Federal Funds Rate', value: '5.25%', change: '+0.25%', dir: 'up' },
    { name: 'CPI Inflation', desc: 'Consumer Price Index', value: '3.2%', change: '-0.3%', dir: 'down' },
    { name: 'GDP Growth', desc: 'Quarterly Growth Rate', value: '2.5%', change: '+0.1%', dir: 'up' },
    { name: 'Unemployment', desc: 'Unemployment Rate', value: '3.7%', change: '+0.1%', dir: 'up' },
    { name: 'USD Index', desc: 'DXY Dollar Index', value: '104.2', change: '+0.8', dir: 'up' },
    { name: 'Consumer Confidence', desc: 'Conference Board Index', value: '102.0', change: '-1.5', dir: 'down' },
    { name: 'Trade Balance', desc: 'Balance of Trade', value: '-$68.3B', change: '-$2.1B', dir: 'down' },
    { name: 'Housing Starts', desc: 'New Construction', value: '1.46M', change: '+3.2%', dir: 'up' },
  ],
  india: [
    { name: 'Interest Rate', desc: 'Repo Rate (RBI)', value: '6.50%', change: '0%', dir: 'up' },
    { name: 'CPI Inflation', desc: 'Consumer Price Index', value: '4.8%', change: '-0.2%', dir: 'down' },
    { name: 'GDP Growth', desc: 'Quarterly Growth Rate', value: '7.2%', change: '+0.3%', dir: 'up' },
    { name: 'Unemployment', desc: 'Unemployment Rate', value: '7.1%', change: '-0.2%', dir: 'down' },
    { name: 'USD/INR', desc: 'Exchange Rate', value: '83.20', change: '+0.15', dir: 'up' },
    { name: 'Consumer Confidence', desc: 'RBI Survey Index', value: '89.6', change: '+1.2', dir: 'up' },
    { name: 'Trade Balance', desc: 'Balance of Trade', value: '-$22.1B', change: '+$0.8B', dir: 'up' },
    { name: 'Industrial Production', desc: 'IIP Growth', value: '5.8%', change: '+0.4%', dir: 'up' },
  ],
  uk: [
    { name: 'Interest Rate', desc: 'Bank Rate (BoE)', value: '5.25%', change: '0%', dir: 'up' },
    { name: 'CPI Inflation', desc: 'Consumer Price Index', value: '4.0%', change: '-0.6%', dir: 'down' },
    { name: 'GDP Growth', desc: 'Quarterly Growth Rate', value: '0.6%', change: '+0.1%', dir: 'up' },
    { name: 'Unemployment', desc: 'Unemployment Rate', value: '4.2%', change: '+0.1%', dir: 'up' },
    { name: 'GBP/USD', desc: 'Exchange Rate', value: '1.27', change: '+0.02', dir: 'up' },
    { name: 'Consumer Confidence', desc: 'GfK Index', value: '-21', change: '+3', dir: 'up' },
    { name: 'Trade Balance', desc: 'Balance of Trade', value: '-£4.1B', change: '-£0.3B', dir: 'down' },
    { name: 'Housing Prices', desc: 'Nationwide Index', value: '-1.8%', change: '+0.5%', dir: 'up' },
  ],
  eu: [
    { name: 'Interest Rate', desc: 'ECB Main Rate', value: '4.50%', change: '0%', dir: 'up' },
    { name: 'CPI Inflation', desc: 'Harmonised CPI', value: '2.9%', change: '-0.4%', dir: 'down' },
    { name: 'GDP Growth', desc: 'Quarterly Growth Rate', value: '0.9%', change: '+0.2%', dir: 'up' },
    { name: 'Unemployment', desc: 'Unemployment Rate', value: '6.4%', change: '-0.1%', dir: 'down' },
    { name: 'EUR/USD', desc: 'Exchange Rate', value: '1.09', change: '-0.01', dir: 'down' },
    { name: 'Consumer Confidence', desc: 'EC Sentiment', value: '-16.1', change: '+0.8', dir: 'up' },
    { name: 'Trade Balance', desc: 'Balance of Trade', value: '€28.2B', change: '+€3.1B', dir: 'up' },
    { name: 'Industrial Production', desc: 'Eurozone Output', value: '-0.5%', change: '+0.3%', dir: 'up' },
  ],
  japan: [
    { name: 'Interest Rate', desc: 'BoJ Policy Rate', value: '-0.10%', change: '0%', dir: 'up' },
    { name: 'CPI Inflation', desc: 'Consumer Price Index', value: '2.8%', change: '+0.1%', dir: 'up' },
    { name: 'GDP Growth', desc: 'Quarterly Growth Rate', value: '1.9%', change: '+0.3%', dir: 'up' },
    { name: 'Unemployment', desc: 'Unemployment Rate', value: '2.5%', change: '0%', dir: 'up' },
    { name: 'USD/JPY', desc: 'Exchange Rate', value: '149.5', change: '+1.2', dir: 'up' },
    { name: 'Consumer Confidence', desc: 'Cabinet Office Index', value: '36.1', change: '+0.8', dir: 'up' },
    { name: 'Trade Balance', desc: 'Balance of Trade', value: '-¥462B', change: '+¥85B', dir: 'up' },
    { name: 'Industrial Production', desc: 'Factory Output', value: '-0.9%', change: '+1.2%', dir: 'up' },
  ],
};

const EDU_CONCEPTS = [
  { title: 'Inflation', desc: 'Understand how rising prices erode purchasing power and affect investment returns across different asset classes.', icon: '📈', iconClass: 'red', link: 'Learn about inflation →' },
  { title: 'Interest Rates', desc: 'Learn how central bank rate decisions impact borrowing costs, bond prices, and stock market valuations.', icon: '🏦', iconClass: 'blue', link: 'Explore interest rates →' },
  { title: 'GDP Growth', desc: 'Discover how economic output growth signals investment opportunities across sectors and geographies.', icon: '📊', iconClass: 'green', link: 'Understand GDP →' },
  { title: 'Monetary Policy', desc: 'How central banks use tools like quantitative easing and interest rates to manage economic stability.', icon: '🏛️', iconClass: 'purple', link: 'Explore monetary policy →' },
];

const TOPIC_PILLS = ['Inflation', 'Interest Rates', 'GDP Growth', 'Unemployment', 'Trade Deficit', 'Fiscal Policy', 'Currency Markets'];

const EVENTS = [
  { date: 'Jan 15, 2026', title: 'Fed Interest Rate Decision', desc: 'Federal Reserve meeting to decide on rate policy.', impact: 'high' },
  { date: 'Jan 22, 2026', title: 'US GDP Report (Q4)', desc: 'Quarterly GDP growth data release.', impact: 'high' },
  { date: 'Feb 1, 2026', title: 'RBI Monetary Policy', desc: 'Reserve Bank of India rate decision.', impact: 'medium' },
  { date: 'Feb 10, 2026', title: 'EU CPI Flash Estimate', desc: 'Preliminary eurozone inflation data.', impact: 'medium' },
  { date: 'Feb 15, 2026', title: 'UK Employment Data', desc: 'UK unemployment and wages report.', impact: 'low' },
  { date: 'Mar 1, 2026', title: 'China PMI Data', desc: 'Manufacturing purchasing managers index.', impact: 'medium' },
];

const SCENARIOS = [
  { id: 'inflation', label: 'Rising Inflation', impacts: [{ asset: 'Equities', val: '-5.2%', neg: true }, { asset: 'Bonds', val: '-8.1%', neg: true }, { asset: 'Gold', val: '+12.3%', neg: false }] },
  { id: 'rate-hike', label: 'Interest Rate Hike', impacts: [{ asset: 'Equities', val: '-3.8%', neg: true }, { asset: 'Bonds', val: '-6.5%', neg: true }, { asset: 'Real Estate', val: '-4.2%', neg: true }] },
  { id: 'oil-shock', label: 'Oil Price Shock', impacts: [{ asset: 'Energy Stocks', val: '+18.5%', neg: false }, { asset: 'Airlines', val: '-12.3%', neg: true }, { asset: 'Consumer', val: '-3.1%', neg: true }] },
];

export default function Macroeconomy() {
  const [country, setCountry] = useState('usa');
  const [conceptSearch, setConceptSearch] = useState('');
  const [activePill, setActivePill] = useState(null);
  const [activeScenario, setActiveScenario] = useState(0);
  const [simInflation, setSimInflation] = useState(4);
  const [simRate, setSimRate] = useState(5);

  // Live macro data from backend
  const [liveData, setLiveData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Article search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch macro data when country changes
  useEffect(() => {
    const fetchMacroData = async () => {
      setDataLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/macro/${country}`);
        if (res.ok) {
          const json = await res.json();
          setLiveData(json.data);
        }
      } catch (err) { console.error('Macro data fetch error:', err); }
      finally { setDataLoading(false); }
    };
    fetchMacroData();
  }, [country]);

  // Article search via /ask
  const handleConceptSearch = async (query) => {
    const q = query || conceptSearch;
    if (!q.trim()) return;
    setSearchLoading(true);
    setSearchResults(null);
    try {
      const res = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: `Explain ${q} and its impact on investments` }),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (err) { console.error('Search error:', err); }
    finally { setSearchLoading(false); }
  };

  const data = INDICATORS[country] || INDICATORS['usa'];
  const selectedCountry = COUNTRIES.find(c => c.id === country);
  const scenario = SCENARIOS[activeScenario];

  return (
    <div className="macro-page">
      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero-content">
          <div className="page-hero-icon">🌍</div>
          <h1>Macroeconomy Dashboard</h1>
          <p>Track economic indicators, understand trends, and analyze their impact on your investments</p>
        </div>
      </div>

      <div className="macro-content">
        {/* Header */}
        <div className="macro-top">
          <h2>📊 Key Economic Indicators</h2>
          <div className="country-select-pill">
            <span>{selectedCountry?.flag}</span>
            <select value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Indicators List */}
        {dataLoading && <p style={{ fontSize: '0.8rem', color: 'var(--primary)', padding: '0.5rem 0' }}>📡 Fetching live data...</p>}
        {liveData && (
          <div className="live-data-banner">
            <div className="live-badge">🟢 Live Data</div>
            <div className="live-indicators">
              {liveData.inflation && <span>Inflation: <strong>{liveData.inflation.value}</strong></span>}
              {liveData.policyRate && <span>{liveData.policyRate.name || 'Policy Rate'}: <strong>{liveData.policyRate.value}</strong></span>}
              {liveData.gdpGrowth && <span>GDP: <strong>{liveData.gdpGrowth.value}</strong></span>}
              {liveData.currency && <span>{liveData.currency.pair}: <strong>{liveData.currency.value}</strong></span>}
            </div>
          </div>
        )}
        <div className="indicators-list">
          {data.map((ind, i) => (
            <div key={i} className="indicator-row">
              <div className="ind-name">
                <strong>{ind.name}</strong>
                <span>{ind.desc}</span>
              </div>
              <div className="ind-value">{ind.value}</div>
              <div className={`ind-change ${ind.dir === 'up' && ind.change.includes('+') ? 'up' : ind.dir === 'down' ? 'down' : 'up'}`}>
                {ind.dir === 'up' ? '▲' : '▼'} {ind.change}
              </div>
            </div>
          ))}
        </div>

        {/* Historical Trends */}
        <div className="macro-section">
          <h3>📉 Historical Trends</h3>
          <div className="trends-grid">
            {['GDP Growth Rate', 'Inflation Rate (CPI)', 'Interest Rate'].map((title, i) => (
              <div key={i} className="trend-chart-card">
                <h4>{title}</h4>
                <div className="trend-chart-placeholder">
                  <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100%' }}>
                    <defs><linearGradient id={`tg${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={['#6366f1','#10b981','#f59e0b'][i]} stopOpacity="0.3"/><stop offset="100%" stopColor={['#6366f1','#10b981','#f59e0b'][i]} stopOpacity="0"/></linearGradient></defs>
                    <path d={[
                      'M10,60 L40,45 L70,50 L100,35 L130,30 L160,20 L190,15 L190,75 L10,75 Z',
                      'M10,30 L40,35 L70,25 L100,40 L130,45 L160,35 L190,30 L190,75 L10,75 Z',
                      'M10,50 L40,50 L70,45 L100,40 L130,35 L160,35 L190,30 L190,75 L10,75 Z',
                    ][i]} fill={`url(#tg${i})`} />
                    <path d={[
                      'M10,60 L40,45 L70,50 L100,35 L130,30 L160,20 L190,15',
                      'M10,30 L40,35 L70,25 L100,40 L130,45 L160,35 L190,30',
                      'M10,50 L40,50 L70,45 L100,40 L130,35 L160,35 L190,30',
                    ][i]} fill="none" stroke={['#6366f1','#10b981','#f59e0b'][i]} strokeWidth="2"/>
                  </svg>
                </div>
                <p>{['Quarterly GDP growth showing recovery trend', 'Consumer price inflation showing easing pattern', 'Central bank rate decisions over the past year'][i]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Educational Concepts */}
        <div className="macro-section">
          <h3>📚 Understanding Macroeconomic Concepts</h3>
          <div className="edu-intro">
            <h4>💡 Why Macroeconomics Matters for Investors</h4>
            <p>Understanding macroeconomic forces helps you anticipate market movements, identify opportunities, and protect your portfolio against economic risks. These concepts form the foundation of informed investment decision-making.</p>
          </div>
          <div className="edu-concepts-grid">
            {EDU_CONCEPTS.map((c, i) => (
              <div key={i} className="edu-concept-card">
                <div className={`edu-concept-icon ${c.iconClass}`}>{c.icon}</div>
                <h4>{c.title}</h4>
                <p>{c.desc}</p>
                <span className="learn-link">{c.link}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Explore Concepts */}
        <div className="explore-concepts">
          <h4>🔍 Explore More Economic Concepts</h4>
          <div className="concept-search">
            <input
              placeholder="Search for economic concepts..."
              value={conceptSearch}
              onChange={(e) => setConceptSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConceptSearch()}
            />
            <button className="concept-search-btn" onClick={() => handleConceptSearch()} disabled={searchLoading || !conceptSearch.trim()}>
              {searchLoading ? '⏳' : '🔍'}
            </button>
          </div>
          <div className="concept-pills">
            {TOPIC_PILLS.map((p, i) => (
              <button key={i} className={`concept-pill ${activePill === i ? 'active' : ''}`} onClick={() => { setActivePill(activePill === i ? null : i); handleConceptSearch(p); }}>{p}</button>
            ))}
          </div>
          {searchLoading && <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}><span className="loading-spinner" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)', width: 20, height: 20, display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }}></span>AI is analyzing this topic...</div>}
          {searchResults && (
            <div className="concept-results">
              <div className="concept-result-card">
                <h5>🔍 {searchResults.topic || conceptSearch}</h5>
                <div className="concept-result-text">
                  {searchResults.script && searchResults.script.split('\n').filter(p => p.trim()).slice(0, 3).map((p, i) => <p key={i}>{p}</p>)}
                </div>
                {searchResults.key_takeaways && (
                  <div className="concept-takeaways">
                    <strong>Key Takeaways:</strong>
                    <ul>{searchResults.key_takeaways.slice(0, 3).map((t, i) => <li key={i}>{t}</li>)}</ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="macro-section">
          <h3>📅 Upcoming Economic Events</h3>
          <div className="events-grid">
            {EVENTS.map((ev, i) => (
              <div key={i} className="event-card">
                <div className="event-date">{ev.date}</div>
                <span className={`event-impact ${ev.impact}`}>{ev.impact === 'high' ? '🔴 High Impact' : ev.impact === 'medium' ? '🟡 Medium Impact' : '🟢 Low Impact'}</span>
                <h4>{ev.title}</h4>
                <p>{ev.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Scoring Engine */}
        <div className="macro-section">
          <h3>🎯 Impact Scoring Engine</h3>
          <div className="impact-tabs">
            {SCENARIOS.map((s, i) => (
              <button key={i} className={`impact-tab ${activeScenario === i ? 'active' : ''}`} onClick={() => setActiveScenario(i)}>{s.label}</button>
            ))}
          </div>
          <div className="impact-chart">
            <svg viewBox="0 0 400 180" style={{ width: '100%', maxWidth: 400 }}>
              {scenario.impacts.map((imp, i) => {
                const barW = 80, gap = 40, startX = 60 + i * (barW + gap);
                const val = parseFloat(imp.val);
                const barH = Math.min(Math.abs(val) * 6, 120);
                const y = imp.neg ? 90 : 90 - barH;
                return (
                  <g key={i}>
                    <rect x={startX} y={y} width={barW} height={barH} rx="4" fill={imp.neg ? '#ef4444' : '#10b981'} opacity="0.8" />
                    <text x={startX + barW/2} y={y - 8} textAnchor="middle" fontSize="12" fontWeight="700" fill={imp.neg ? '#ef4444' : '#10b981'}>{imp.val}</text>
                    <text x={startX + barW/2} y={170} textAnchor="middle" fontSize="10" fill="#64748b">{imp.asset}</text>
                  </g>
                );
              })}
              <line x1="40" y1="90" x2="380" y2="90" stroke="#e2e8f0" strokeWidth="1" />
            </svg>
          </div>
          <div className="impact-cards">
            {scenario.impacts.map((imp, i) => (
              <div key={i} className="impact-card">
                <div className="impact-label">{imp.asset}</div>
                <div className={`impact-val ${imp.neg ? 'neg' : 'pos'}`}>{imp.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scenario Simulator */}
        <div className="macro-section">
          <h3>🔬 Economic Scenario Simulator</h3>
          <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                  Inflation Rate: <strong>{simInflation}%</strong>
                </label>
                <input type="range" className="age-slider" min="0" max="15" step="0.5" value={simInflation} onChange={(e) => setSimInflation(Number(e.target.value))} />
                <div className="age-slider-labels"><span>0%</span><span>15%</span></div>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                  Interest Rate: <strong>{simRate}%</strong>
                </label>
                <input type="range" className="age-slider" min="0" max="15" step="0.25" value={simRate} onChange={(e) => setSimRate(Number(e.target.value))} />
                <div className="age-slider-labels"><span>0%</span><span>15%</span></div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <div className="metric-card green" style={{ textAlign: 'center' }}>
                <div className="m-label">Fixed Income Impact</div>
                <div className="m-value" style={{ color: simRate > 6 ? 'var(--green)' : 'var(--red)' }}>{simRate > 6 ? '+' : ''}{((simRate - 5) * 1.5).toFixed(1)}%</div>
              </div>
              <div className="metric-card purple" style={{ textAlign: 'center' }}>
                <div className="m-label">Equity Impact</div>
                <div className="m-value" style={{ color: simInflation > 5 ? 'var(--red)' : 'var(--green)' }}>{simInflation > 5 ? '' : '+'}{((5 - simInflation) * 2).toFixed(1)}%</div>
              </div>
              <div className="metric-card amber" style={{ textAlign: 'center' }}>
                <div className="m-label">Gold Impact</div>
                <div className="m-value" style={{ color: simInflation > 4 ? 'var(--green)' : 'var(--text-muted)' }}>{simInflation > 4 ? '+' : ''}{((simInflation - 3) * 2.5).toFixed(1)}%</div>
              </div>
            </div>

            {/* Pro Overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', borderRadius: 'var(--radius-xl)', display: 'none', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem' }}>🔒</span>
              <span style={{ fontWeight: 600 }}>Pro Feature</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Upgrade to Pro to access the full simulator</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
