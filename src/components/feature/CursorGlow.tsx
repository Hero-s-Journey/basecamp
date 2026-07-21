import { useEffect, useRef } from "react";

/**
 * A soft warm glow that follows the cursor across the whole site.
 * Fixed, full-viewport, non-interactive — no hard edges.
 */
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      el.style.setProperty("--cx", `${e.clientX}px`);
      el.style.setProperty("--cy", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[45]"
      style={{
        background:
          "radial-gradient(300px circle at var(--cx, 50%) var(--cy, 50%), rgba(226,114,75,0.09) 0%, rgba(226,114,75,0.04) 35%, transparent 70%)",
      }}
    />
  );
}
