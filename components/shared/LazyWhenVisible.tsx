"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type LazyWhenVisibleProps = {
  children: ReactNode;
  rootMargin?: string;
  className?: string;
};

/** Renders children only when the placeholder scrolls near the viewport. */
export function LazyWhenVisible({
  children,
  rootMargin = "200px",
  className,
}: LazyWhenVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, visible]);

  return <div ref={ref} className={className}>{visible ? children : null}</div>;
}
