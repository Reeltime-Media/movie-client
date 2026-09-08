"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { posterThumbUrl, posterUrl } from "@/lib/api/core/config";
import { listSeries } from "@/lib/api/series";
import type { SeriesRead } from "@/lib/api/types";

export type SeriesPickerModalProps = {
  onSelect: (series: SeriesRead) => void;
  onClose: () => void;
};

export function SeriesPickerModal({ onSelect, onClose }: SeriesPickerModalProps) {
  const [series, setSeries] = useState<SeriesRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    listSeries()
      .then((list) => {
        if (!cancelled) setSeries(list);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return series;
    return series.filter((s) => s.title.toLowerCase().includes(q));
  }, [series, query]);

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Choose a series to unlock"
    >
      <div
        className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="text-[15px] font-bold text-text">Choose a series to unlock</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-elevated hover:text-text"
          >
            <X size={16} />
          </button>
        </div>

        <div className="border-b border-border px-5 py-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2">
            <Search size={14} className="shrink-0 text-text-muted" aria-hidden />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search series…"
              className="w-full bg-transparent text-[13px] text-text outline-none placeholder:text-text-muted"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-brand" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-text-muted">No series found.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {filtered.map((s) => {
                const image = posterThumbUrl(s.poster_key, 300, s.updated_at) ?? posterUrl(s.poster_key, s.updated_at);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelect(s)}
                    className="group cursor-pointer text-left"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-border bg-surface-elevated transition-colors group-hover:border-border-hover">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- small picker thumbnail, not worth next/image's overhead here
                        <img
                          src={image}
                          alt={s.title}
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                    <p className="mt-1.5 truncate text-[12px] font-medium text-text">{s.title}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
