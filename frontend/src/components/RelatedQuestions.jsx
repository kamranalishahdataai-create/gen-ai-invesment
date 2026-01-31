/**
 * RelatedQuestions Component
 * ==========================
 * Displays clickable related questions for further exploration
 * 
 * Props:
 * - items: Array of related question strings
 * - onQuestionClick: Callback when user clicks a question
 */
export default function RelatedQuestions({ items, onQuestionClick }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="related-questions-container">
      <ul className="related-list">
        {items.map((item, idx) => (
          <li key={idx} className="related-item">
            <button 
              className="related-question-btn"
              onClick={() => onQuestionClick && onQuestionClick(item)}
            >
              <span className="question-icon">❓</span>
              <span className="question-text">{item}</span>
              <span className="arrow-icon">→</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="related-footer">
        <span>🔍 Click any question to learn more</span>
      </div>
    </div>
  );
}
