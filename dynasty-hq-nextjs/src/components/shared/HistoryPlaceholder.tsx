export default function HistoryPlaceholder() {
  return (
    <div className="card primary center" style={{ padding: '32px 16px' }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          background: 'color-mix(in srgb, var(--primary) 25%, transparent)',
          border: '1px solid color-mix(in srgb, var(--primary) 60%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
        }}
      >
        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>H</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>History Page — Coming Soon</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', maxWidth: 280, margin: '0 auto' }}>
        Once Season 2 kicks off, this is where you&apos;ll browse past seasons&apos; records, awards, rosters, and rankings.
      </div>
    </div>
  );
}
