import { initials } from '@/lib/format';

export default function Badge({ text, size = 24, mine = false }: { text: any; size?: number; mine?: boolean }) {
  const color = mine ? 'var(--accent)' : 'rgba(255,255,255,0.75)';
  return (
    <div className="badge" style={{ width: size, height: size, fontSize: Math.round(size * 0.4), color }}>
      {initials(text)}
    </div>
  );
}
