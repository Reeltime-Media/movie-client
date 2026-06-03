"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

export type ScrollRevealVariant = "fade-up" | "fade-in" | "fade-up-scale";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  variant?: ScrollRevealVariant;
  /** Delay before transition starts (ms). */
  delay?: number;
  /** Intersection ratio (0–1) required to trigger. */
  threshold?: number;
  /** IntersectionObserver rootMargin (e.g. "0px 0px -8% 0px"). */
  rootMargin?: string;
  as?: ElementType;
};

export function ScrollReveal({
  children,
  className = "",
  variant = "fade-up",
  delay = 0,
  threshold = 0.12,
  rootMargin = "0px 0px -6% 0px",
  as: Component = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const variantClass =
    variant === "fade-in"
      ? "rt-scroll-reveal--fade-in"
      : variant === "fade-up-scale"
        ? "rt-scroll-reveal--fade-up-scale"
        : "";

  return (
    <Component
      ref={ref}
      className={[
        "rt-scroll-reveal",
        variantClass,
        visible ? "rt-scroll-reveal--visible" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--rt-scroll-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Component>
  );
}
