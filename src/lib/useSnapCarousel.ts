import { useRef, useState } from "react";

/**
 * Horizontal snap carousel primitive. Tracks the active slide by finding the
 * child whose centre is closest to the viewport centre — works for full-width
 * slides and for peek layouts (narrow cards + gap) alike. `goTo(i)` centres the
 * target card.
 */
export function useSnapCarousel(count: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    if (!children.length) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    let closest: number;
    if (el.scrollLeft >= maxScroll - 2) {
      // Scrolled fully to the end — last card may not be able to center under
      // a peek layout, so treat "at end" as the last slide.
      closest = children.length - 1;
    } else if (el.scrollLeft <= 2) {
      closest = 0;
    } else {
      const viewportCenter = el.scrollLeft + el.clientWidth / 2;
      let min = Infinity;
      closest = 0;
      children.forEach((c, i) => {
        const center = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.abs(center - viewportCenter);
        if (d < min) {
          min = d;
          closest = i;
        }
      });
    }
    if (closest !== index && closest < count) setIndex(closest);
  };

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const child = el.children[i] as HTMLElement | undefined;
    if (!child) return;
    el.scrollTo({
      left: child.offsetLeft - (el.clientWidth - child.offsetWidth) / 2,
      behavior: "smooth",
    });
  };

  return { ref, index, onScroll, goTo };
}
