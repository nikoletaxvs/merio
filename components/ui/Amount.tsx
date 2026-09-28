/** Euro amount from cents, set in mono so columns of money line up. */
export function Amount({
  cents,
  className = "",
}: {
  cents: number;
  className?: string;
}) {
  return (
    <span className={`font-mono tabular-nums ${className}`}>
      €{(cents / 100).toFixed(2)}
    </span>
  );
}
