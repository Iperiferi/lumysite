interface CharCountProps {
  current: number;
  max: number;
}

export default function CharCount({ current, max }: CharCountProps) {
  const cls =
    current >= max
      ? 'text-destructive font-medium'
      : current >= max * 0.85
      ? 'text-amber-500'
      : 'text-muted-foreground';
  return (
    <p className={`text-xs text-right ${cls}`}>
      {current}/{max}
    </p>
  );
}
