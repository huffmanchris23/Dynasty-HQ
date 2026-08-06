/** Port of moveIndicator(row). Not referenced by any tab today — same as the original. */
export default function MoveIndicator({ row }: { row?: { enteredPoll?: boolean; changeDir?: string | null; changeNum?: number | null } | null }) {
  if (row && row.enteredPoll) return <span className="move-up" style={{ fontSize: 10 }}>NEW</span>;
  const dir = row ? row.changeDir : null;
  const num = row ? row.changeNum : 0;
  if (dir === 'UP') return <span className="move-up">▲ {num}</span>;
  if (dir === 'DOWN') return <span className="move-down">▼ {num}</span>;
  return <span className="move-flat">—</span>;
}
