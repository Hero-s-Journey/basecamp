import { useRef, type ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  /** Extra classes for the card box (padding, layout, etc.). */
  className?: string;
  /** Glow colour (rgba recommended). */
  glow?: string;
  /** Soft inner wash near the cursor. Disable for image cards. */
  wash?: boolean;
}

/**
 * Dark card with a border that lights up and follows the cursor on hover.
 * Inspired by the spotlight-border cards on starrylabs.io.
 */
export default function GlowCard({
  children,
  className = "",
  glow = "rgba(226,114,75,0.9)",
  wash = true,
}: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`group relative rounded-3xl border border-white/10 bg-night-800 ${className}`}
    >
      <div className="relative h-full">{children}</div>

      {/* Soft inner wash near the cursor — above content */}
      {wash && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.06), transparent 60%)`,
          }}
        />
      )}
      {/* Cursor-tracking border glow — masked to the border ring only */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), ${glow}, transparent 70%)`,
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1.5px",
        }}
      />
    </div>
  );
}
