import { useState } from 'react';

const RISK_OPTIONS = [
  { id: 'no-risk', title: 'No Risk', subtitle: 'Capital Preservation', desc: 'Capital preservation is my top priority. I prefer guaranteed returns with minimal fluctuation.', icon: '🛡️', iconClass: 'safe' },
  { id: 'risk-averse', title: 'Risk Averse', subtitle: 'Moderate Growth', desc: 'I can accept small fluctuations for moderate growth potential over time.', icon: '⚖️', iconClass: 'moderate' },
  { id: 'risk-taking', title: 'Risk Taking', subtitle: 'High Return Potential', desc: 'I\'m comfortable with higher volatility for potentially larger returns.', icon: '🚀', iconClass: 'aggressive' },
];

const INSTRUMENTS = {
  'no-risk': [
    { id: 'fd', name: 'Fixed Deposit', desc: 'Guaranteed returns from bank deposits with fixed tenure.', returns: '6.5-7.5%', risk: 'Very Low' },
    { id: 'ppf', name: 'PPF', desc: 'Government-backed long-term savings with tax benefits.', returns: '7.1%', risk: 'Very Low' },
    { id: 'govt-bonds', name: 'Government Bonds', desc: 'Sovereign debt instruments with guaranteed returns.', returns: '7.0-7.5%', risk: 'Very Low' },
    { id: 'tbills', name: 'Treasury Bills', desc: 'Short-term government securities with high liquidity.', returns: '6.8%', risk: 'Very Low' },
  ],
  'risk-averse': [
    { id: 'index-fund', name: 'Index Fund', desc: 'Track market indices like Nifty 50 for diversified exposure.', returns: '10-12%', risk: 'Moderate' },
    { id: 'etf', name: 'ETF', desc: 'Exchange-traded funds offering liquidity with diversification.', returns: '10-14%', risk: 'Moderate' },
    { id: 'balanced-mf', name: 'Balanced Mutual Fund', desc: 'Mix of equity and debt for balanced growth.', returns: '8-12%', risk: 'Moderate' },
    { id: 'debt-funds', name: 'Debt Funds', desc: 'Corporate debt instruments with moderate returns.', returns: '7-9%', risk: 'Low-Moderate' },
  ],
  'risk-taking': [
    { id: 'small-cap', name: 'Small Cap Stocks', desc: 'High growth potential with small-cap companies.', returns: '15-25%', risk: 'High' },
    { id: 'mid-cap', name: 'Mid Cap Equities', desc: 'Growing mid-size companies with strong potential.', returns: '12-18%', risk: 'High' },
    { id: 'sectoral', name: 'Sectoral Funds', desc: 'Industry-focused funds for concentrated bets.', returns: '12-20%', risk: 'High' },
    { id: 'crypto', name: 'Crypto Assets', desc: 'Digital currencies with high volatility.', returns: 'Variable', risk: 'Very High' },
  ],
};

const TOP_PERFORMING = {
  'no-risk': [
    { name: 'HDFC Bank FD', ticker: 'HDFC-FD', country: 'India', returns: '7.10%', aum: '₹2.5T', sharpe: '2.1', div: '7.10%' },
    { name: 'SBI Fixed Deposit', ticker: 'SBI-FD', country: 'India', returns: '6.80%', aum: '₹3.1T', sharpe: '1.9', div: '6.80%' },
    { name: 'PPF Account', ticker: 'PPF', country: 'India', returns: '7.10%', aum: 'Sovereign', sharpe: '2.3', div: '7.10%' },
  ],
  'risk-averse': [
    { name: 'Nippon India ETF Nifty', ticker: 'NETF', country: 'India', returns: '13.2%', aum: '₹48,500 Cr', sharpe: '1.8', div: '1.2%' },
    { name: 'SBI ETF Sensex', ticker: 'SETF', country: 'India', returns: '12.8%', aum: '₹1,25,000 Cr', sharpe: '1.7', div: '1.1%' },
    { name: 'HDFC Balanced Advantage', ticker: 'HDFCBAL', country: 'India', returns: '11.8%', aum: '₹64,000 Cr', sharpe: '1.5', div: '2.3%' },
  ],
  'risk-taking': [
    { name: 'Quant Small Cap Fund', ticker: 'QUANT', country: 'India', returns: '28.5%', aum: '₹22,000 Cr', sharpe: '2.1', div: '0.5%' },
    { name: 'Axis Midcap Fund', ticker: 'AXISMID', country: 'India', returns: '18.3%', aum: '₹25,000 Cr', sharpe: '1.6', div: '0.8%' },
    { name: 'ICICI Technology Fund', ticker: 'ICICTECH', country: 'India', returns: '22.1%', aum: '₹12,000 Cr', sharpe: '1.9', div: '0.3%' },
  ],
};

const LEARN_ARTICLES = {
  'no-risk': [
    { title: 'Understanding Fixed Deposits', desc: 'A beginner guide to bank FDs and how they work.', tags: ['Basics', 'FD'], time: '5 min' },
    { title: 'PPF vs FD: Which is Better?', desc: 'Compare two popular safe investment instruments.', tags: ['Comparison', 'PPF'], time: '7 min' },
    { title: 'How Government Bonds Work', desc: 'Learn about sovereign debt and guaranteed returns.', tags: ['Bonds', 'Education'], time: '6 min' },
  ],
  'risk-averse': [
    { title: 'Index Funds for Beginners', desc: 'Why passive investing through index funds works.', tags: ['Index', 'Basics'], time: '5 min' },
    { title: 'ETF vs Mutual Fund', desc: 'Key differences and which suits your needs.', tags: ['ETF', 'Comparison'], time: '8 min' },
    { title: 'Asset Allocation Strategies', desc: 'Build a balanced portfolio for steady growth.', tags: ['Strategy', 'Portfolio'], time: '6 min' },
  ],
  'risk-taking': [
    { title: 'Small Cap Investing Guide', desc: 'How to find high-growth small cap stocks.', tags: ['Small Cap', 'Growth'], time: '7 min' },
    { title: 'Sector Analysis Framework', desc: 'Identify promising sectors for concentrated bets.', tags: ['Sectoral', 'Analysis'], time: '9 min' },
    { title: 'Managing High-Risk Portfolios', desc: 'Risk management for aggressive investors.', tags: ['Risk', 'Advanced'], time: '8 min' },
  ],
};

const STEPS = [
  { icon: '👤', label: 'Investor Profile' },
  { icon: '⚡', label: 'Risk Preference' },
  { icon: '📊', label: 'Suggestions' },
  { icon: '🧮', label: 'Calculator' },
];

const HORIZONS = [
  { value: '1-3', label: '1-3 Years', desc: 'Short Term' },
  { value: '3-7', label: '3-7 Years', desc: 'Medium Term' },
  { value: '10+', label: '10+ Years', desc: 'Long Term' },
];

export default function InvestmentWizard({ onOpenInstrument }) {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState(30);
  const [profile, setProfile] = useState({ income: '', amount: '', country: 'India', horizon: '3-7' });
  const [risk, setRisk] = useState(null);
  const [selectedInst, setSelectedInst] = useState(null);

  const canNext0 = profile.amount && profile.horizon;
  const canNext1 = risk !== null;

  const goNext = () => { if (step < 3) setStep(step + 1); };
  const goBack = () => { if (step > 0) setStep(step - 1); };

  const instruments = risk ? INSTRUMENTS[risk] || [] : [];
  const topPerf = risk ? TOP_PERFORMING[risk] || [] : [];
  const articles = risk ? LEARN_ARTICLES[risk] || LEARN_ARTICLES['no-risk'] : LEARN_ARTICLES['no-risk'];

  const riskLabel = risk === 'no-risk' ? 'No Risk (Capital Preservation)' : risk === 'risk-averse' ? 'Risk Averse (Moderate Growth)' : 'Risk Taking (High Return Potential)';

  return (
    <div className="wizard-page">
      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero-content">
          <div className="page-hero-icon">🧙‍♂️</div>
          <h1>Smart Investment Wizard</h1>
          <p>Let us guide you to the right investments based on your profile and preferences</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="wizard-stepper-wrap">
        <div className="wizard-stepper">
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'contents' }}>
              <div className={`wiz-step ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`} onClick={() => i < step && setStep(i)} style={{ cursor: i < step ? 'pointer' : 'default' }}>
                <div className="wiz-step-circle">{i < step ? '✓' : s.icon}</div>
                <span className="wiz-step-label">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`wiz-step-line ${i < step ? 'completed' : ''}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 0: Profile */}
      {step === 0 && (
        <div className="wizard-card">
          <h3>Tell Us About Yourself</h3>
          <p className="wiz-desc">Share your investment preferences to get personalized recommendations</p>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>👤 Age: <strong>{age}</strong></label>
              <div className="age-slider-wrap">
                <input type="range" className="age-slider" min="18" max="75" value={age} onChange={(e) => setAge(Number(e.target.value))} />
                <div className="age-slider-labels"><span>18</span><span>75</span></div>
              </div>
            </div>
            <div className="form-group">
              <label>💰 Monthly Income (Optional)</label>
              <input type="number" placeholder="e.g. 50000" value={profile.income} onChange={(e) => setProfile({ ...profile, income: e.target.value })} />
            </div>
            <div className="form-group">
              <label>💵 Investment Amount</label>
              <input type="number" placeholder="e.g. 100000" value={profile.amount} onChange={(e) => setProfile({ ...profile, amount: e.target.value })} />
            </div>
            <div className="form-group full-width">
              <label>🌍 Country of Investment</label>
              <select value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })}>
                <option value="India">India</option>
                <option value="USA">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="EU">European Union</option>
                <option value="Japan">Japan</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label>⏳ Investment Horizon</label>
              <div className="horizon-cards">
                {HORIZONS.map((h) => (
                  <div key={h.value} className={`horizon-card ${profile.horizon === h.value ? 'selected' : ''}`} onClick={() => setProfile({ ...profile, horizon: h.value })}>
                    <h4>{h.label}</h4>
                    <p>{h.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="wizard-actions end">
            <button className="btn-wiz primary" onClick={goNext} disabled={!canNext0}>Next Step →</button>
          </div>
        </div>
      )}

      {/* Step 1: Risk */}
      {step === 1 && (
        <div className="wizard-card">
          <h3 style={{ textAlign: 'center' }}>Select Your Risk Preference</h3>
          <p className="wiz-desc" style={{ textAlign: 'center' }}>Choose how much risk you are comfortable with for your investments</p>
          <div className="risk-cards">
            {RISK_OPTIONS.map((opt) => (
              <div key={opt.id} className={`risk-card ${risk === opt.id ? 'selected' : ''}`} onClick={() => setRisk(opt.id)}>
                <div className={`risk-card-icon ${opt.iconClass}`}>{opt.icon}</div>
                <h4>{opt.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500, marginBottom: '0.25rem' }}>{opt.subtitle}</p>
                <p>{opt.desc}</p>
              </div>
            ))}
          </div>
          <div className="wizard-actions">
            <button className="btn-wiz secondary" onClick={goBack}>← Back</button>
            <button className="btn-wiz primary" onClick={goNext} disabled={!canNext1}>Next Step →</button>
          </div>
        </div>
      )}

      {/* Step 2: Suggestions */}
      {step === 2 && (
        <>
          {/* Instruments */}
          <div className="instruments-section">
            <div className="instruments-header">
              <h3>Recommended Investment Instruments</h3>
              <p className="profile-badge">Based on your <strong>{riskLabel}</strong> profile</p>
            </div>
            <p className="instruments-sub">Click on any instrument to see detailed information and compare options</p>
            <div className="instruments-grid">
              {instruments.map((inst) => (
                <div key={inst.id} className={`instrument-card ${selectedInst === inst.id ? 'selected' : ''}`} onClick={() => { setSelectedInst(inst.id === selectedInst ? null : inst.id); if (onOpenInstrument) onOpenInstrument(inst); }}>
                  {selectedInst === inst.id && <div className="check-mark">✓</div>}
                  <h4>{inst.name}</h4>
                  <p className="inst-desc">{inst.desc}</p>
                  <div className="inst-metrics">
                    <div><span className="inst-metric-label">Expected Return</span><div className="inst-metric-value green">{inst.returns}</div></div>
                    <div><span className="inst-metric-label">Risk Level</span><div className="inst-metric-value">{inst.risk}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing */}
          <div className="top-performing">
            <div className="top-performing-header">
              <h3>🏆 Top Performing {risk === 'no-risk' ? 'Safe Instruments' : risk === 'risk-averse' ? 'Moderate Funds' : 'Growth Funds'}</h3>
              <span className="country-badge">🇮🇳 {profile.country}</span>
            </div>
            {topPerf.map((item, i) => (
              <div key={i} className="tp-row">
                <div className="tp-info">
                  <h4>{item.name} <span className="tp-ticker">{item.ticker}</span> <span className="tp-country-tag">{item.country}</span></h4>
                  <div className="tp-metrics">
                    <span className="tp-metric"><span className="val green">{item.returns}</span> <span className="lbl">Returns</span></span>
                    <span className="tp-metric"><span className="val">{item.aum}</span> <span className="lbl">AUM</span></span>
                    <span className="tp-metric"><span className="val">{item.sharpe}</span> <span className="lbl">Sharpe</span></span>
                    <span className="tp-metric"><span className="val">{item.div}</span> <span className="lbl">Dividend</span></span>
                  </div>
                </div>
                <button className="btn-view" onClick={() => onOpenInstrument && onOpenInstrument(instruments[0])}>View →</button>
              </div>
            ))}
          </div>

          {/* Learn Articles */}
          <div className="learn-section">
            <h3>📖 Learn About These Instruments</h3>
            <div className="learn-grid">
              {articles.map((art, i) => (
                <div key={i} className="learn-card">
                  <span className="read-time">{art.time} read</span>
                  <h4>{art.title}</h4>
                  <p>{art.desc}</p>
                  <div className="tags">{art.tags.map((t, j) => <span key={j} className="tag">{t}</span>)}</div>
                  <span className="read-link">Read Article →</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ maxWidth: '750px', margin: '0 auto 2rem' }}>
            <div className="wizard-actions">
              <button className="btn-wiz secondary" onClick={goBack}>← Back</button>
              <button className="btn-wiz accent" onClick={goNext}>Calculate Returns →</button>
            </div>
          </div>
        </>
      )}

      {/* Step 3: Calculator */}
      {step === 3 && <Calculator profile={profile} risk={risk} goBack={goBack} />}
    </div>
  );
}

function Calculator({ profile, risk, goBack }) {
  const amount = parseFloat(profile.amount) || 100000;
  const horizonMap = { '1-3': 2, '3-7': 5, '10+': 12 };
  const horizon = horizonMap[profile.horizon] || 5;
  const rates = { 'no-risk': 7, 'risk-averse': 11, 'risk-taking': 18 };
  const rate = rates[risk] || 10;
  const futureValue = amount * Math.pow(1 + rate / 100, horizon);
  const gains = futureValue - amount;

  return (
    <div className="wizard-card">
      <h3>Investment Returns Calculator</h3>
      <p className="wiz-desc">Estimated returns based on your investment profile</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
        <div className="metric-card purple" style={{ textAlign: 'center' }}>
          <div className="m-label">Investment Amount</div>
          <div className="m-value">₹{amount.toLocaleString('en-IN')}</div>
        </div>
        <div className="metric-card blue" style={{ textAlign: 'center' }}>
          <div className="m-label">Expected Rate</div>
          <div className="m-value">{rate}% p.a.</div>
        </div>
        <div className="metric-card amber" style={{ textAlign: 'center' }}>
          <div className="m-label">Time Period</div>
          <div className="m-value">{horizon} years</div>
        </div>
        <div className="metric-card green" style={{ textAlign: 'center' }}>
          <div className="m-label">Future Value</div>
          <div className="m-value green">₹{Math.round(futureValue).toLocaleString('en-IN')}</div>
        </div>
      </div>
      <div style={{ marginTop: '1.25rem', background: '#dcfce7', borderRadius: 'var(--radius-lg)', padding: '1.25rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 500 }}>Total Estimated Gains</div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a' }}>₹{Math.round(gains).toLocaleString('en-IN')}</div>
      </div>
      <div className="wizard-actions" style={{ marginTop: '1.5rem' }}>
        <button className="btn-wiz secondary" onClick={goBack}>← Back</button>
      </div>
    </div>
  );
}
