import type { ReactNode, SVGProps } from "react";

type IconDefinition = {
  viewBox: string;
  strokeWidth: number;
  body: ReactNode;
};

const icons = {
  arrowRight: {
    viewBox: "0 0 24 24",
    strokeWidth: 2,
    body: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
  },
  bell: {
    viewBox: "0 0 20 20",
    strokeWidth: 1.4,
    body: (
      <path d="M10 3a4.5 4.5 0 0 0-4.5 4.5c0 3.6-1.5 5-1.5 5h12s-1.5-1.4-1.5-5A4.5 4.5 0 0 0 10 3Zm-1.8 12a2 2 0 0 0 3.6 0" />
    ),
  },
  brush: {
    viewBox: "0 0 24 24",
    strokeWidth: 2,
    body: (
      <>
        <path d="M9 11 3 17v4h4l6-6" />
        <path d="M10.8 12.2 20.6 2.4a1.9 1.9 0 0 1 2.7 0l.3.3a1.9 1.9 0 0 1 0 2.7L13.8 14.2" />
        <path d="m9 11 4 4" />
      </>
    ),
  },
  calendar: {
    viewBox: "0 0 20 20",
    strokeWidth: 1.6,
    body: (
      <>
        <rect x="3.5" y="5" width="13" height="11" rx="2.5" />
        <path d="M3.5 8.5h13M7 3v3m6-3v3" />
      </>
    ),
  },
  check: {
    viewBox: "0 0 20 20",
    strokeWidth: 1.8,
    body: <path d="M4 10.5 8 14.5 16 6" />,
  },
  chevronDown: {
    viewBox: "0 0 20 20",
    strokeWidth: 1.8,
    body: <path d="M5 7.5 10 12.5 15 7.5" />,
  },
  clock: {
    viewBox: "0 0 24 24",
    strokeWidth: 2,
    body: (
      <>
        <path d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="10" />
      </>
    ),
  },
  close: {
    viewBox: "0 0 20 20",
    strokeWidth: 1.8,
    body: <path d="m5 5 10 10M15 5 5 15" />,
  },
  copy: {
    viewBox: "0 0 20 20",
    strokeWidth: 1.6,
    body: (
      <>
        <rect x="7" y="7" width="9" height="9" rx="2" />
        <path d="M13 4.5H6A1.5 1.5 0 0 0 4.5 6v7" />
      </>
    ),
  },
  euro: {
    viewBox: "0 0 20 20",
    strokeWidth: 1.7,
    body: <path d="M12.5 4.5a5.5 5.5 0 1 0 0 11M4.5 8.5h6m-6 3h6" />,
  },
  logout: {
    viewBox: "0 0 20 20",
    strokeWidth: 1.5,
    body: (
      <path d="M12.5 6.5V5A1.5 1.5 0 0 0 11 3.5H5A1.5 1.5 0 0 0 3.5 5v10A1.5 1.5 0 0 0 5 16.5h6a1.5 1.5 0 0 0 1.5-1.5v-1.5m2-6.5L18 10l-3 3.5m3-3.5H7.5" />
    ),
  },
  pencil: {
    viewBox: "0 0 20 20",
    strokeWidth: 1.5,
    body: <path d="M12.8 3.7l3.5 3.5L6.5 17H3v-3.5l9.8-9.8Z" />,
  },
  refresh: {
    viewBox: "0 0 20 20",
    strokeWidth: 1.6,
    body: (
      <path d="M15.5 8A6 6 0 0 0 5 6.2M4.5 12a6 6 0 0 0 10.5 1.8M15.8 4v3.5h-3.5M4.2 16v-3.5h3.5" />
    ),
  },
  trash: {
    viewBox: "0 0 20 20",
    strokeWidth: 1.4,
    body: (
      <path d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6m2.5 0-.7 9.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5.5 6" />
    ),
  },
} satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof icons;

type IconProps = Omit<SVGProps<SVGSVGElement>, "name" | "viewBox"> & {
  name: IconName;
  /** Accessible label. Omit for decorative icons (hidden from screen readers). */
  title?: string;
};

export function Icon({
  name,
  title,
  className = "h-4 w-4",
  strokeWidth,
  ...props
}: IconProps) {
  const icon = icons[name];

  return (
    <svg
      viewBox={icon.viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? icon.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title && <title>{title}</title>}
      {icon.body}
    </svg>
  );
}
