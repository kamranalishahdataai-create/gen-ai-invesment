export default function Takeaways({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="takeaways-card">
      <h3>💡 Key Takeaways</h3>
      <ul className="takeaways-list">
        {items.map((item, idx) => (
          <li key={idx}>
            <span className="takeaway-number">{idx + 1}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
