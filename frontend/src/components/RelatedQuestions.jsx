export default function RelatedQuestions({ items, onQuestionClick }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="related-questions">
      <h4>Related Questions</h4>
      {items.map((item, idx) => (
        <button
          key={idx}
          className="related-btn"
          onClick={() => onQuestionClick && onQuestionClick(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
