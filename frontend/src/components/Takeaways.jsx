/**
 * Takeaways Component
 * ===================
 * Displays key takeaways from the educational content
 * Updated to match client feedback with numbered list
 * 
 * Props:
 * - items: Array of takeaway strings
 */
export default function Takeaways({ items }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="takeaways-container">
      <ul className="takeaways-list">
        {items.map((item, idx) => (
          <li key={idx} className="takeaway-item">
            <span className="takeaway-number">{idx + 1}</span>
            <span className="takeaway-text">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
