/**
 * MarketPanel Component
 * =====================
 * Displays market data and instrument comparisons
 * 
 * Phase 2: Shows real market data with fallback indicators
 * 
 * Props:
 * - marketData: Object containing price, trend, metrics
 * - comparison: Object containing comparison table data
 */
export default function MarketPanel({ marketData, comparison }) {
  if (!marketData) {
    return null;
  }

  // Determine trend color
  const getTrendClass = (direction) => {
    switch (direction) {
      case "up": return "trend-up";
      case "down": return "trend-down";
      default: return "trend-neutral";
    }
  };

  // Check if data is from live source
  const isLiveData = marketData.source === "Live API";

  return (
    <div className="market-panel">
      {/* Market Data Card */}
      <div className="market-card">
        <div className="market-header">
          <h3>{marketData.display_name || marketData.name || marketData.instrument}</h3>
          <span className={`trend-badge ${getTrendClass(marketData.trend_direction)}`}>
            {marketData.trend_direction === "up" && "📈"}
            {marketData.trend_direction === "down" && "📉"}
            {marketData.trend_direction === "neutral" && "➡️"}
            {marketData.trend}
          </span>
        </div>

        {/* Price Display */}
        <div className="price-display">
          <span className="price-value">{marketData.current_value || marketData.price}</span>
          {marketData.unit && <span className="price-unit">{marketData.unit}</span>}
          {marketData.change && marketData.change !== "N/A" && (
            <span className={`price-change ${getTrendClass(marketData.trend_direction)}`}>
              {marketData.change} {marketData.change_percent && `(${marketData.change_percent})`}
            </span>
          )}
        </div>

        {/* Metrics Grid */}
        {marketData.metrics && (
          <div className="metrics-grid">
            {Object.entries(marketData.metrics).map(([key, value], idx) => (
              <div key={idx} className="metric-item">
                <span className="metric-label">{key}</span>
                <span className="metric-value">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Last Updated with Source Indicator */}
        <div className="last-updated">
          <span>🕐 Last updated: {marketData.last_updated}</span>
          <span className={`source-badge ${isLiveData ? 'live-badge' : 'demo-badge'}`}>
            {isLiveData ? '🟢 Live Data' : '📊 Demo Data'}
          </span>
        </div>
      </div>

      {/* Comparison Table */}
      {comparison && comparison.comparison && (
        <div className="comparison-card">
          <div className="comparison-header">
            <h3>📊 Comparison: {comparison.primary} vs {comparison.secondary}</h3>
          </div>
          
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  {comparison.comparison.headers.map((header, idx) => (
                    <th key={idx}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.comparison.rows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className={cellIdx === 0 ? "metric-name" : ""}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="comparison-footer">
            <span>💡 This comparison helps you understand the key differences between investment options</span>
          </div>
        </div>
      )}

      {/* Educational Note */}
      <div className="educational-note">
        <span className="note-icon">📚</span>
        <span>This data is for educational purposes only. Not investment advice.</span>
      </div>
    </div>
  );
}
