interface MetricIconProps {
  /** Either a Remix icon class (e.g. "ri-fire-line") or a custom key like "custom-chest". */
  name: string;
  className?: string;
}

/**
 * Renders either a custom SVG icon (for muscle groups Remix doesn't cover)
 * or a Remix icon font glyph. SVG icons scale with font-size via 1em.
 */
export default function MetricIcon({ name, className = "" }: MetricIconProps) {
  const common = {
    viewBox: "0 0 24 24",
    width: "1em",
    height: "1em",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  if (name === "custom-chest") {
    // Two stacked pectoral curves
    return (
      <svg {...common}>
        <path d="M4 8c0-.8.7-1.5 1.5-1.5H10c1 0 1.8.5 2 1.5v3c0 1.7-1.5 3-3.2 3H6.5C5 14 4 12.8 4 11.5V8z" />
        <path d="M20 8c0-.8-.7-1.5-1.5-1.5H14c-1 0-1.8.5-2 1.5v3c0 1.7 1.5 3 3.2 3h2.3C19 14 20 12.8 20 11.5V8z" />
      </svg>
    );
  }
  if (name === "custom-back") {
    // V-shape lats with a central spine
    return (
      <svg {...common}>
        <path d="M12 4v16" />
        <path d="M4 8l8 6 8-6" />
        <path d="M5 14l7 5 7-5" />
      </svg>
    );
  }
  if (name === "custom-legs") {
    // Two legs with knees
    return (
      <svg {...common}>
        <path d="M9 4v6l-1 5v5" />
        <path d="M15 4v6l1 5v5" />
        <circle cx="8" cy="11" r="0.6" fill="currentColor" stroke="none" />
        <circle cx="16" cy="11" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  // Fallback: Remix icon font
  return <i className={`${name} ${className}`} />;
}
