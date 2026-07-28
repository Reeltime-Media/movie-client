"use client";

import { useEffect, useRef } from "react";

/** Past this distance the gesture counts as a drag, not a click. */
const DRAG_THRESHOLD_PX = 6;

/**
 * Click-hold-and-move panning for a horizontal scroll container.
 * Only kicks in for mouse pointers — touch keeps native swipe scrolling.
 */
export function useDragScroll() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startScrollLeft = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
      el.classList.add("rt-dragging");
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > DRAG_THRESHOLD_PX) moved = true;
      el.scrollLeft = startScrollLeft - dx;
    };

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("rt-dragging");
    };

    // Swallow the click that follows a drag so cards don't navigate.
    const onClickCapture = (e: MouseEvent) => {
      if (!moved) return;
      moved = false;
      e.preventDefault();
      e.stopPropagation();
    };

    // Stop native image/link dragging from hijacking the gesture.
    const onDragStart = (e: DragEvent) => {
      if (dragging) e.preventDefault();
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    el.addEventListener("click", onClickCapture, true);
    el.addEventListener("dragstart", onDragStart);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("click", onClickCapture, true);
      el.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  return ref;
}
