export function GuestStepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Menos huéspedes"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-sand-dark bg-white text-lg text-ink transition-colors hover:bg-sand-dark disabled:opacity-40"
      >
        −
      </button>
      <span className="min-w-[3rem] text-center text-lg font-semibold text-ink">{value}</span>
      <button
        type="button"
        aria-label="Más huéspedes"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-sand-dark bg-white text-lg text-ink transition-colors hover:bg-sand-dark disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
