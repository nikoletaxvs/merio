/** The Merio logo mark. Colours follow the theme tokens. */
export function MerioMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <rect width="24" height="24" rx="4" className="fill-foreground" />
      <path
        d="M6.5 16.5v-9l5.5 9 5.5-9v9"
        className="stroke-background"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
