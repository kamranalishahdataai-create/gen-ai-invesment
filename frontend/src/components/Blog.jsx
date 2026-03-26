import { useState } from 'react';

const FILTERS = ['All', 'Policy Changes', 'Geopolitical Events', 'Business Events', 'Demand & Supply', 'New Projects', 'Market Analysis'];

const FEATURED_ARTICLES = [
  {
    title: 'Understanding Market Cycles: A Complete Guide for Indian Investors',
    desc: 'Learn how economic cycles affect different asset classes and how to position your portfolio through bull and bear markets for maximum returns.',
    tag: 'Strategy',
    author: 'Priya Sharma',
    date: 'Dec 15, 2024',
    readTime: '8 min read',
    gradient: 'linear-gradient(135deg, #6366f1, #7c3aed)',
  },
  {
    title: 'Top 5 Index Funds for Long-Term Wealth',
    desc: 'Compare the best Nifty 50 and Sensex index funds for building wealth.',
    tag: 'Mutual Funds',
    author: 'Rahul Mehta',
    date: 'Dec 12, 2024',
    readTime: '5 min read',
    gradient: 'linear-gradient(135deg, #0d9488, #10b981)',
  },
  {
    title: 'RBI Policy Impact on Your Investments',
    desc: 'How interest rate decisions directly affect your portfolio returns.',
    tag: 'Macro',
    author: 'Anita Desai',
    date: 'Dec 10, 2024',
    readTime: '6 min read',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
  },
];

const ARTICLES = [
  { title: 'RBI Rate Cut Impact on Fixed Income Investments', desc: 'How the latest policy rate changes affect bond prices, FD rates, and debt mutual fund returns for Indian investors.', tag: 'Policy Changes', author: 'Vikram Patel', date: 'Mar 15, 2026', readTime: '6 min read', gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)' },
  { title: 'US-China Trade War: Investment Implications', desc: 'Analyzing how rising geopolitical tensions between superpowers create risks and opportunities in global markets.', tag: 'Geopolitical Events', author: 'Neha Gupta', date: 'Mar 10, 2026', readTime: '7 min read', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { title: 'Adani Group Expansion: Sector Analysis', desc: 'How major business conglomerate moves reshape industry dynamics and create new investment themes.', tag: 'Business Events', author: 'Arjun Singh', date: 'Mar 5, 2026', readTime: '5 min read', gradient: 'linear-gradient(135deg, #10b981, #0d9488)' },
  { title: 'EV Demand Surge: Supply Chain Bottlenecks', desc: 'Understanding how demand-supply imbalances in the EV sector are creating winners and losers among listed companies.', tag: 'Demand & Supply', author: 'Kavita Rao', date: 'Feb 28, 2026', readTime: '7 min read', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  { title: 'India\'s Semiconductor Push: New Investment Frontier', desc: 'New manufacturing projects and policy incentives opening up fresh investment opportunities in the chip ecosystem.', tag: 'New Projects', author: 'Suresh Iyer', date: 'Feb 22, 2026', readTime: '8 min read', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
  { title: 'Gold vs Bitcoin: Safe Haven Showdown 2026', desc: 'Comparing traditional and digital safe-haven assets in the current macroeconomic environment.', tag: 'Market Analysis', author: 'Meera Nair', date: 'Feb 18, 2026', readTime: '6 min read', gradient: 'linear-gradient(135deg, #0ea5e9, #3b82f6)' },
];

export default function Blog() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = ARTICLES.filter((a) => {
    const matchFilter = activeFilter === 'All' || a.tag === activeFilter;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="blog-page">
      {/* Hero */}
      <div className="page-hero">
        <h1>Investment Insights Blog</h1>
        <p>Stay informed with the latest investment strategies, market analysis, and educational content</p>
      </div>

      {/* Featured Articles */}
      <div className="blog-featured">
        <h2 className="section-title">Featured Articles</h2>
        <div className="blog-featured-grid">
          {/* Large featured */}
          <div className="blog-featured-main">
            <div className="blog-featured-img" style={{ background: FEATURED_ARTICLES[0].gradient }}>
              <span className="blog-badge">{FEATURED_ARTICLES[0].tag}</span>
            </div>
            <div className="blog-featured-body">
              <h3>{FEATURED_ARTICLES[0].title}</h3>
              <p>{FEATURED_ARTICLES[0].desc}</p>
              <div className="blog-meta">
                <span className="blog-author">{FEATURED_ARTICLES[0].author}</span>
                <span>{FEATURED_ARTICLES[0].date}</span>
                <span>{FEATURED_ARTICLES[0].readTime}</span>
              </div>
            </div>
          </div>
          {/* Stacked right */}
          <div className="blog-featured-side">
            {FEATURED_ARTICLES.slice(1).map((a, i) => (
              <div key={i} className="blog-featured-side-card">
                <div className="blog-featured-side-img" style={{ background: a.gradient }}>
                  <span className="blog-badge">{a.tag}</span>
                </div>
                <div className="blog-featured-side-body">
                  <h4>{a.title}</h4>
                  <p>{a.desc}</p>
                  <div className="blog-meta">
                    <span className="blog-author">{a.author}</span>
                    <span>{a.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="blog-toolbar">
        <div className="blog-search-bar">
          <span className="blog-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="blog-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`blog-filter-pill${activeFilter === f ? ' active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Latest Articles */}
      <h2 className="section-title">Latest Articles</h2>
      <div className="blog-grid">
        {filtered.map((article, i) => (
          <div key={i} className="blog-card">
            <div className="blog-card-img" style={{ background: article.gradient }}>
              <span className="blog-badge">{article.tag}</span>
            </div>
            <div className="blog-card-body">
              <h4>{article.title}</h4>
              <p>{article.desc}</p>
              <div className="blog-meta">
                <span className="blog-author">{article.author}</span>
                <span>{article.date}</span>
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
            No articles found matching your criteria.
          </p>
        )}
      </div>
    </div>
  );
}
