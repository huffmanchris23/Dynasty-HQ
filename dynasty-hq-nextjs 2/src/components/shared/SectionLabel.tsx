export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="section-label">
      <div className="dot" />
      <span>{children}</span>
    </div>
  );
}
