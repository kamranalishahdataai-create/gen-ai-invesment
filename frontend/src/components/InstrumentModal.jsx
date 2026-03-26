import { useState, useEffect } from 'react';

const API_BASE_URL = "http://127.0.0.1:8000";

const TABS = ['Performance', 'Risk', 'Fundamentals', 'Macro'];

const METRICS = {
  fd: { beta: '0.00', sharpe: '1.20', maxDrawdown: '0%', volatility: '0.1%', expense: '0%', liquidity: 'Medium', pe: 'N/A', divYield: '7.1%' },
  ppf: { beta: '0.00', sharpe: '1.15', maxDrawdown: '0%', volatility: '0%', expense: '0%', liquidity: 'Low', pe: 'N/A', divYield: '7.1%' },
  'govt-bonds': { beta: '0.05', sharpe: '1.10', maxDrawdown: '0.5%', volatility: '0.3%', expense: '0%', liquidity: 'High', pe: 'N/A', divYield: '7.25%' },
  tbills: { beta: '0.00', sharpe: '1.05', maxDrawdown: '0%', volatility: '0.1%', expense: '0%', liquidity: 'High', pe: 'N/A', divYield: '6.8%' },
  'index-fund': { beta: '1.00', sharpe: '1.45', maxDrawdown: '12.5%', volatility: '14.2%', expense: '0.2%', liquidity: 'High', pe: '22.5', divYield: '1.2%' },
  etf: { beta: '1.38', sharpe: '1.00', maxDrawdown: '19.8%', volatility: '1.76%', expense: '0.07%', liquidity: 'Very High', pe: '24.1', divYield: '1.1%' },
  'balanced-mf': { beta: '0.65', sharpe: '1.30', maxDrawdown: '8.2%', volatility: '9.5%', expense: '1.5%', liquidity: 'High', pe: '18.3', divYield: '2.3%' },
  'debt-funds': { beta: '0.15', sharpe: '0.95', maxDrawdown: '3.1%', volatility: '2.8%', expense: '0.5%', liquidity: 'High', pe: 'N/A', divYield: '6.5%' },
  'small-cap': { beta: '1.45', sharpe: '1.60', maxDrawdown: '25.3%', volatility: '22.1%', expense: '0.6%', liquidity: 'Medium', pe: '32.1', divYield: '0.5%' },
  'mid-cap': { beta: '1.20', sharpe: '1.35', maxDrawdown: '18.7%', volatility: '17.5%', expense: '0.8%', liquidity: 'High', pe: '28.4', divYield: '0.8%' },
  sectoral: { beta: '1.30', sharpe: '1.25', maxDrawdown: '20.5%', volatility: '19.3%', expense: '1.2%', liquidity: 'Medium', pe: '30.2', divYield: '0.3%' },
  crypto: { beta: '2.50', sharpe: '0.80', maxDrawdown: '55.0%', volatility: '65.0%', expense: '0.5%', liquidity: 'Very High', pe: 'N/A', divYield: '0%' },
};

const COMPARE_OPTIONS = [
  { name: 'Fixed Deposit', type: 'Safe', returns: '7.0%' },
  { name: 'Nifty 50 Index Fund', type: 'Moderate', returns: '12.5%' },
  { name: 'Gold ETF', type: 'Hedge', returns: '8.2%' },
];

const CHART_POINTS = [
  { m: 'Oct', v: 100 }, { m: 'Nov', v: 103 }, { m: 'Dec', v: 98 },
  { m: 'Jan', v: 107 }, { m: 'Feb', v: 112 }, { m: 'Mar', v: 115 },
];

export default function InstrumentModal({ instrument, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const [liveData, setLiveData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!instrument) return;
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/market-data/${encodeURIComponent(instrument.name)}`);
        if (res.ok) {
          const data = await res.json();
          setLiveData(data);
        }
      } catch (err) { console.error('Market data fetch error:', err); }
      finally { setDataLoading(false); }
    };
    fetchData();
  }, [instrument]);

  if (!instrument) return null;

  const m = METRICS[instrument.id] || METRICS['fd'];
  // Merge live data if available
  const live = liveData?.metrics || {};

  // SVG line chart data
  const max = Math.max(...CHART_POINTS.map(p => p.v));
  const min = Math.min(...CHART_POINTS.map(p => p.v));
  const range = max - min || 1;
  const w = 540, h = 170, pad = 30;
  const points = CHART_POINTS.map((p, i) => ({
    x: pad + (i / (CHART_POINTS.length - 1)) * (w - 2 * pad),
    y: pad + ((max - p.v) / range) * (h - 2 * pad),
    ...p,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length-1].x},${h - pad} L${points[0].x},${h - pad} Z`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="instrument-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-info">
            <h2>{instrument.name}</h2>
            <span className="ticker">Expected Returns: {instrument.returns}</span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-tabs">
          {TABS.map((tab, i) => (
            <button key={tab} className={`modal-tab ${i === activeTab ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
              {['📈', '⚠️', '📊', '🌍'][i]} {tab}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {/* Chart */}
          <div className="chart-container">
            <div className="chart-title">📈 6-Month Performance</div>
            <div className="chart-placeholder">
              <svg className="chart-svg" viewBox={`0 0 ${w} ${h}`}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#areaGrad)" />
                <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" />
                {points.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="4" fill="#6366f1" stroke="white" strokeWidth="2" />
                    <text x={p.x} y={h - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">{p.m}</text>
                    <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fill="#6366f1" fontWeight="600">{p.v}</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 0 && (
            <div className="metrics-section">
              <h4>📊 Performance Metrics</h4>
              {dataLoading && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading live data...</p>}
              <div className="metrics-grid">
                <div className="metric-card purple"><div className="m-label">Expected Returns</div><div className="m-value green">{instrument.returns}</div></div>
                <div className="metric-card blue"><div className="m-label">Sharpe Ratio</div><div className="m-value">{m.sharpe}</div></div>
                <div className="metric-card green"><div className="m-label">Volatility</div><div className="m-value">{live['1M_change'] || m.volatility}</div></div>
              </div>
              {liveData && (
                <div className="metrics-grid" style={{ marginTop: '0.75rem' }}>
                  {liveData.price && <div className="metric-card amber"><div className="m-label">Current Price</div><div className="m-value">{liveData.price}</div></div>}
                  {liveData.trend && <div className="metric-card blue"><div className="m-label">Trend</div><div className="m-value">{liveData.trend}</div></div>}
                  {live['1Y_change'] && <div className="metric-card green"><div className="m-label">1Y Change</div><div className="m-value">{live['1Y_change']}</div></div>}
                </div>
              )}
            </div>
          )}

          {activeTab === 1 && (
            <div className="metrics-section">
              <h4>⚠️ Risk Metrics</h4>
              <div className="metrics-grid">
                <div className="metric-card pink"><div className="m-label">Beta</div><div className="m-value">{m.beta}</div></div>
                <div className="metric-card amber"><div className="m-label">Max Drawdown</div><div className="m-value red">{m.maxDrawdown}</div></div>
                <div className="metric-card blue"><div className="m-label">Std Deviation</div><div className="m-value">{m.volatility}</div></div>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="metrics-section">
              <h4>📊 Fundamental Metrics</h4>
              <div className="metrics-grid">
                <div className="metric-card green"><div className="m-label">Expense Ratio</div><div className="m-value">{m.expense}</div></div>
                <div className="metric-card purple"><div className="m-label">P/E Ratio</div><div className="m-value">{m.pe}</div></div>
                <div className="metric-card blue"><div className="m-label">Dividend Yield</div><div className="m-value green">{m.divYield}</div></div>
              </div>
            </div>
          )}

          {activeTab === 3 && (
            <div className="metrics-section">
              <h4>🌍 Macroeconomic Indicators</h4>
              <div className="metrics-grid">
                <div className="metric-card amber"><div className="m-label">Repo Rate</div><div className="m-value">6.5%</div></div>
                <div className="metric-card pink"><div className="m-label">CPI Inflation</div><div className="m-value">4.8%</div></div>
                <div className="metric-card green"><div className="m-label">GDP Growth</div><div className="m-value green">7.2%</div></div>
              </div>
            </div>
          )}

          {/* Compare */}
          <div className="compare-section">
            <h4>Compare with Similar Options</h4>
            <p className="compare-sub">See how this instrument stacks up against alternatives</p>
            <div className="compare-grid">
              {COMPARE_OPTIONS.map((opt, i) => (
                <div key={i} className="compare-card">
                  <h5>{opt.name}</h5>
                  <p>{opt.type} · {opt.returns} returns</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
