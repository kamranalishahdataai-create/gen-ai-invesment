import { useState, useRef, useEffect } from 'react';

const API_BASE_URL = "http://127.0.0.1:8000";

const TRENDS = [
  { icon: '📉', title: 'Fixed Income vs Inflation', stat: 'Real yields turning positive after 3 years', desc: 'With central banks maintaining restrictive monetary policies, fixed income instruments are finally offering real positive yields. Government bonds and corporate debt are becoming attractive again for conservative investors seeking stable returns.', visual: '📊' },
  { icon: '📈', title: 'Shift Towards Equities', stat: 'Equity allocation increased by 12% in 2024', desc: 'Institutional and retail investors alike are increasing their equity allocations as corporate earnings continue to surprise on the upside. Emerging markets are seeing renewed interest as valuations remain attractive relative to developed markets.', visual: '🏦' },
  { icon: '👥', title: 'Rising Retail Participation', stat: '45M new demat accounts opened in India', desc: 'Democratization of investing continues at an unprecedented pace. Mobile-first platforms and fractional investing have lowered barriers to entry, bringing millions of first-time investors into the market.', visual: '📱' },
  { icon: '🌐', title: 'Expanding Capital Markets', stat: 'Global market cap crossed $110 trillion', desc: 'Capital markets worldwide are expanding with new listings, innovative financial products, and increasing cross-border investment flows. ESG and thematic investing continue to gain mainstream adoption.', visual: '🌍' },
];

const TESTIMONIALS = [
  { name: 'Sarah Johnson', role: 'Retail Investor', text: 'Investarn helped me understand market dynamics and build a diversified portfolio. The AI-powered insights are incredibly accurate and easy to understand.', initials: 'SJ' },
  { name: 'Michael Chen', role: 'Financial Analyst', text: 'The macroeconomic dashboard is the best I\'ve seen. Real-time indicators with AI analysis make it an indispensable tool for my daily research workflow.', initials: 'MC' },
  { name: 'Priya Sharma', role: 'First-time Investor', text: 'As someone new to investing, the Smart Wizard made it so easy to get started. The personalized recommendations matched my risk tolerance perfectly.', initials: 'PS' },
];

const PRICING = [
  { name: 'Free', price: '$0', period: '/month', desc: 'Perfect for getting started with investing basics', features: ['5 AI queries per day', 'Basic investor guide', 'Market overview dashboard', 'Community access', 'Email support'], featured: false },
  { name: 'Pro', price: '$19', period: '/month', desc: 'For serious investors who want deeper insights', features: ['Unlimited AI queries', 'Smart Investment Wizard', 'Video explanations', 'Macroeconomy dashboard', 'Impact scoring engine', 'Priority support'], featured: true },
  { name: 'Enterprise', price: '$99', period: '/month', desc: 'For teams and organizations', features: ['Everything in Pro', 'Portfolio intelligence', 'Custom reports & analytics', 'API access', 'Dedicated account manager', 'Custom integrations'], featured: false },
];

export default function Homepage({ onSearch, onNavigate, isLoading }) {
  const [query, setQuery] = useState('');
  const [videoTopic, setVideoTopic] = useState('');
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoGenId, setVideoGenId] = useState(null);
  const [videoStatus, setVideoStatus] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoError, setVideoError] = useState(null);

  useEffect(() => {
    let interval;
    if (videoGenId && videoStatus !== 'completed' && videoStatus !== 'failed') {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/video-status/${videoGenId}`);
          if (res.ok) {
            const data = await res.json();
            setVideoStatus(data.status);
            if (data.status === 'completed' && data.video_url) {
              setVideoUrl(data.video_url);
              setVideoLoading(false);
            } else if (data.status === 'failed') {
              setVideoError('Video generation failed. Please try again.');
              setVideoLoading(false);
            }
          }
        } catch (err) { console.error(err); }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [videoGenId, videoStatus]);

  const handleVideoGenerate = async (e) => {
    e.preventDefault();
    if (!videoTopic.trim()) return;
    setVideoLoading(true);
    setVideoError(null);
    setVideoUrl(null);
    setVideoStatus('starting');
    try {
      const res = await fetch(`${API_BASE_URL}/generate-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: videoTopic.trim(), style: 'professional', duration: 5 }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to start video generation');
      }
      const data = await res.json();
      setVideoGenId(data.generation_id);
      setVideoStatus(data.status);
    } catch (err) {
      setVideoError(err.message);
      setVideoLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <>
      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-content">
          <h1>Learn investing the <span>easy way</span> and build wealth the <span>right way</span></h1>
          <p className="hero-sub">AI-powered platform to help you understand investments, assess risks, and make smarter financial decisions with personalized recommendations.</p>
          <form className="home-search" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Ask anything about investing — stocks, bonds, mutual funds..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" disabled={isLoading || !query.trim()}>
              {isLoading ? <><span className="loading-spinner"></span>Searching...</> : '🔍 Search'}
            </button>
          </form>
        </div>
      </section>

      {/* Market Trend Sections */}
      <section className="trend-sections">
        {TRENDS.map((t, i) => (
          <div key={i} className="trend-block">
            <div className="trend-block-content">
              <h2><span className="trend-icon">{t.icon}</span> {t.title}</h2>
              <div className="trend-stat">{t.stat}</div>
              <p>{t.desc}</p>
              <button className="btn-trend" onClick={() => onNavigate('macroeconomy')}>Learn More →</button>
            </div>
            <div className="trend-block-visual">{t.visual}</div>
          </div>
        ))}
      </section>

      {/* Text-to-Video Section */}
      <section className="video-demo-section">
        <h2 className="section-title">AI-Powered Video Learning</h2>
        <p className="section-subtitle">Enter any investment topic and our AI will generate an educational video for you</p>
        <div className="video-demo-container">
          <div className="video-demo-input-area">
            <form className="video-demo-form" onSubmit={handleVideoGenerate}>
              <input
                type="text"
                placeholder="e.g. What are mutual funds and how do they work?"
                value={videoTopic}
                onChange={(e) => setVideoTopic(e.target.value)}
                disabled={videoLoading}
              />
              <button type="submit" disabled={videoLoading || !videoTopic.trim()}>
                {videoLoading ? '⏳ Generating...' : '🎬 Generate Video'}
              </button>
            </form>
            <div className="video-demo-tags">
              {['Mutual Funds', 'Stock Market Basics', 'SIP Investing', 'Gold ETF'].map((t) => (
                <button key={t} className="video-demo-tag" onClick={() => setVideoTopic(t)} disabled={videoLoading}>{t}</button>
              ))}
            </div>
          </div>
          <div className="video-demo-player">
            {videoUrl ? (
              <video controls autoPlay style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' }}>
                <source src={videoUrl} type="video/mp4" />
              </video>
            ) : (
              <div className="video-demo-placeholder">
                {videoLoading ? (
                  <>
                    <div className="loading-spinner" style={{ width: 32, height: 32, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white', marginBottom: '0.5rem' }}></div>
                    <span>Generating your video... ({videoStatus || 'starting'})</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>This may take 2-5 minutes</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '3rem' }}>🎬</span>
                    <span>Your AI-generated video will appear here</span>
                  </>
                )}
              </div>
            )}
            {videoError && <div style={{ padding: '0.5rem 0.75rem', background: '#fee2e2', color: '#dc2626', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginTop: '0.5rem' }}>⚠️ {videoError}</div>}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '0 1.5rem' }}>
        <div className="cta-banner">
          <h2>Ready to Make Smarter Investment Decisions?</h2>
          <p>Join thousands of investors using AI-powered insights to build better portfolios.</p>
          <button className="btn-cta-white" onClick={() => onNavigate('wizard')}>Start Your Journey →</button>
        </div>
      </section>

      {/* Explore Our Platform */}
      <section className="explore-platform">
        <h2 className="section-title">Explore Our Platform</h2>
        <p className="section-subtitle">Everything you need to become a confident investor</p>
        <div className="explore-grid">
          <div className="explore-card" onClick={() => onNavigate('investor-guide')}>
            <div className="explore-card-icon">📚</div>
            <div>
              <h4>Investor Guide</h4>
              <p>Comprehensive guides on stocks, mutual funds, bonds, and alternative investments.</p>
              <span className="explore-link">Explore Guide →</span>
            </div>
          </div>
          <div className="explore-card" onClick={() => onNavigate('macroeconomy')}>
            <div className="explore-card-icon">🌍</div>
            <div>
              <h4>Macroeconomy</h4>
              <p>Track economic indicators, understand trends, and analyze their impact on investments.</p>
              <span className="explore-link">View Dashboard →</span>
            </div>
          </div>
          <div className="explore-card" onClick={() => onNavigate('blog')}>
            <div className="explore-card-icon">📝</div>
            <div>
              <h4>Investment Insights Blog</h4>
              <p>Expert articles, market analysis, and educational content updated weekly.</p>
              <span className="explore-link">Read Articles →</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Learning Content */}
      <section className="featured-content">
        <h2 className="section-title" style={{ textAlign: 'center' }}>Featured Learning Content</h2>
        <p className="section-subtitle" style={{ textAlign: 'center' }}>Curated educational articles to accelerate your financial literacy</p>
        <div className="featured-grid">
          <div className="featured-card">
            <h4>Understanding Market Cycles</h4>
            <p>Learn how economic cycles affect different asset classes and how to position your portfolio accordingly.</p>
            <span className="fc-meta">5 min read · Beginner</span>
          </div>
          <div className="featured-card">
            <h4>Risk Assessment Framework</h4>
            <p>A comprehensive guide to understanding and managing investment risk across different market conditions.</p>
            <span className="fc-meta">8 min read · Intermediate</span>
          </div>
          <div className="featured-card">
            <h4>Building a Diversified Portfolio</h4>
            <p>Step-by-step approach to creating a well-balanced investment portfolio that aligns with your goals.</p>
            <span className="fc-meta">6 min read · Beginner</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Four simple steps to smarter investing</p>
        <div className="steps-row">
          {[
            { icon: '📋', title: 'Create Profile', desc: 'Share your financial goals and risk preferences' },
            { icon: '🤖', title: 'AI Analysis', desc: 'Our engine analyzes your profile for best matches' },
            { icon: '📊', title: 'Get Recommendations', desc: 'Receive personalized investment suggestions' },
            { icon: '📚', title: 'Learn & Invest', desc: 'Access educational content and start investing' },
          ].map((s, i) => (
            <div key={i} className="step-item">
              <div className="step-icon-circle">{s.icon}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2 className="section-title">What Our Users Say</h2>
        <p className="section-subtitle">Trusted by investors worldwide</p>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p>"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.initials}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar">
        <div className="stats-bar-inner">
          <h3>Trusted by Investors Worldwide</h3>
          <div className="stats-row">
            <div className="stat-item"><div className="stat-value">150K+</div><div className="stat-label">Active Users</div></div>
            <div className="stat-item"><div className="stat-value">2.5M+</div><div className="stat-label">AI Queries Answered</div></div>
            <div className="stat-item"><div className="stat-value">500+</div><div className="stat-label">Educational Articles</div></div>
            <div className="stat-item"><div className="stat-value">4.9/5</div><div className="stat-label">User Rating</div></div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing-section">
        <h2 className="section-title">Choose Your Plan</h2>
        <p className="section-subtitle">Start free and upgrade as you grow your investment knowledge</p>
        <div className="pricing-grid">
          {PRICING.map((plan, i) => (
            <div key={i} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
              {plan.featured && <span className="pricing-badge">Most Popular</span>}
              <h3>{plan.name}</h3>
              <div className="pricing-price">
                <span className="currency">$</span>{plan.price.replace('$', '')}
                <span className="period">{plan.period}</span>
              </div>
              <p className="pricing-desc">{plan.desc}</p>
              <ul className="pricing-features">
                {plan.features.map((f, j) => <li key={j}>{f}</li>)}
              </ul>
              <button className={`btn-pricing ${plan.featured ? 'filled' : 'outline'}`}>
                {plan.price === '$0' ? 'Get Started Free' : 'Start Free Trial'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
