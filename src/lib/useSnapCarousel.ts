import { useRef, useState } from "react";

/**
 * Horizontal snap carousel primitive. Track current slide index by rounding
 * scrollLeft/clientWidth; expose `goTo(i)` for external navigation (dots).
 */
export function useSnapCarousel(count: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const w = el.clientWidth;
    const i = Math.round(el.scrollLeft / w);
    if (i !== index && i >= 0 && i < count) setIndex(i);
  };

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return { ref, index, onScroll, goTo };
}
