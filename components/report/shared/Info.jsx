export function Info({ label, value }) {
  return (
    <div className="info">
      <span>{label}</span>
      <strong>{value || "N/A"}</strong>
    </div>
  );
}
