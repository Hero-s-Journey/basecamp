import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Runs GSAP setup scoped to a container element via gsap.context,
 * so every tween/ScrollTrigger created inside is reverted on unmount.
 */
export function useGsap<T extends HTMLElement = HTMLElement>(
  setup: (el: T) => void,
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => setup(el), el);
    return () => ctx.revert();
    // setup is intentionally not a dependency — animations run once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
