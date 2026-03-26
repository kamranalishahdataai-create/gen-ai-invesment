import { useState } from 'react';
import Navigation from './components/Navigation';
import Homepage from './components/Homepage';
import InvestmentWizard from './components/InvestmentWizard';
import InstrumentModal from './components/InstrumentModal';
import InvestorGuide from './components/InvestorGuide';
import Macroeconomy from './components/Macroeconomy';
import Blog from './components/Blog';
import SignIn from './components/SignIn';
import Footer from './components/Footer';
import TopicContent from './components/TopicContent';
import VideoPlaceholder from './components/VideoPlaceholder';
import Takeaways from './components/Takeaways';
import RelatedQuestions from './components/RelatedQuestions';

const API_BASE_URL = "http://127.0.0.1:8000";

export default function App() {
  const [page, setPage] = useState('home');
  const [subId, setSubId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [topicView, setTopicView] = useState(null);

  const navigate = (newPage, newSubId) => {
    setPage(newPage);
    setSubId(newSubId || null);
    setTopicView(null);
    window.scrollTo(0, 0);
  };

  const handleSearch = async (query) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setPage('results');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Request failed');
      }
      const data = await res.json();
      setResults({ query, ...data });
    } catch (err) {
      if (err.name === 'AbortError') setError('Request timed out. Please try again.');
      else if (err.message.includes('Failed to fetch')) setError('Cannot connect to server. Make sure the backend is running.');
      else setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = (topicTitle, category) => {
    setTopicView(topicTitle);
  };

  const renderPage = () => {
    if (topicView) {
      return <TopicContent topic={topicView} onBack={() => setTopicView(null)} />;
    }

    switch (page) {
      case 'home':
        return <Homepage onSearch={handleSearch} onNavigate={navigate} isLoading={loading} />;

      case 'wizard':
        return <InvestmentWizard onOpenInstrument={setSelectedInstrument} />;

      case 'investor-guide':
        return <InvestorGuide initialCategory={subId} onSelectTopic={handleTopicSelect} />;

      case 'macroeconomy':
        return <Macroeconomy />;

      case 'blog':
        return <Blog />;

      case 'signin':
        return <SignIn onNavigate={navigate} />;

      case 'results':
        return (
          <div className="results-section">
            {loading && (
              <div className="results-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="loading-spinner" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)', width: '32px', height: '32px', margin: '0 auto 1rem' }}></div>
                <p style={{ color: 'var(--text-secondary)' }}>AI is analyzing your question...</p>
              </div>
            )}

            {error && (
              <div className="results-card">
                <h3>⚠️ Error</h3>
                <p style={{ color: 'var(--red)' }}>{error}</p>
                <button className="btn-wizard primary" onClick={() => navigate('home')} style={{ marginTop: '1rem' }}>
                  Go Back
                </button>
              </div>
            )}

            {results && (
              <>
                <div className="results-card">
                  <h3>🔍 {results.query}</h3>
                  <div className="results-text">
                    {results.script && results.script.split('\n').filter(p => p.trim()).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>

                {results.key_takeaways && <Takeaways items={results.key_takeaways} />}

                <VideoPlaceholder script={results.script} topic={results.query} />

                {results.related_questions && (
                  <RelatedQuestions
                    items={results.related_questions}
                    onQuestionClick={(q) => handleSearch(q)}
                  />
                )}

                {results.gold_price && (
                  <div className="results-card">
                    <h3>📊 Market Data</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                      {results.gold_price.price_gram_24k && (
                        <div style={{ background: 'var(--bg-gray)', padding: '1rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gold 24K/gram</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--orange)' }}>₹{results.gold_price.price_gram_24k}</div>
                        </div>
                      )}
                      {results.gold_price.price_gram_22k && (
                        <div style={{ background: 'var(--bg-gray)', padding: '1rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gold 22K/gram</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--orange)' }}>₹{results.gold_price.price_gram_22k}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {results.disclaimer && (
                  <div style={{ padding: '1rem', background: 'var(--bg-gray)', borderRadius: 'var(--radius-lg)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {results.disclaimer}
                  </div>
                )}
              </>
            )}
          </div>
        );

      default:
        return <Homepage onSearch={handleSearch} onNavigate={navigate} isLoading={loading} />;
    }
  };

  return (
    <div className="app-container">
      <Navigation activePage={page} onNavigate={navigate} />
      <main className="main-content">
        {renderPage()}
      </main>
      {page !== 'signin' && <Footer onNavigate={navigate} />}

      {selectedInstrument && (
        <InstrumentModal
          instrument={selectedInstrument}
          onClose={() => setSelectedInstrument(null)}
        />
      )}
    </div>
  );
}
