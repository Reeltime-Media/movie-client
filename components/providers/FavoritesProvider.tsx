"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { addFavorite, listFavorites, removeFavorite } from "@/lib/api/favorites";
import { useAuth } from "@/hooks/auth/use-auth";

type FavoritesContextValue = {
  favoriteIds: ReadonlySet<string>;
  loaded: boolean;
  isFavorite: (contentId: string) => boolean;
  toggleFavorite: (contentId: string) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

const NO_FAVORITES: ReadonlySet<string> = new Set<string>();

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { loggedIn } = useAuth();
  // null = not fetched yet for the current login session.
  const [fetchedIds, setFetchedIds] = useState<Set<string> | null>(null);

  // Drop stale favorites after logout (adjust-state-during-render pattern).
  if (!loggedIn && fetchedIds !== null) {
    setFetchedIds(null);
  }

  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;
    listFavorites()
      .then((rows) => {
        if (!cancelled) setFetchedIds(new Set(rows.map((r) => r.content_id)));
      })
      .catch(() => {
        if (!cancelled) setFetchedIds(new Set());
      });
    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  const favoriteIds: ReadonlySet<string> = (loggedIn ? fetchedIds : null) ?? NO_FAVORITES;
  const loaded = !loggedIn || fetchedIds !== null;

  const toggleFavorite = useCallback(
    async (contentId: string) => {
      if (!loggedIn) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      let wasFavorite = false;
      setFetchedIds((prev) => {
        const base = prev ?? new Set<string>();
        wasFavorite = base.has(contentId);
        const next = new Set(base);
        if (wasFavorite) next.delete(contentId);
        else next.add(contentId);
        return next;
      });
      try {
        if (wasFavorite) await removeFavorite(contentId);
        else await addFavorite(contentId);
      } catch {
        setFetchedIds((prev) => {
          const next = new Set(prev ?? new Set<string>());
          if (wasFavorite) next.add(contentId);
          else next.delete(contentId);
          return next;
        });
      }
    },
    [loggedIn, router],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteIds,
      loaded,
      isFavorite: (contentId) => favoriteIds.has(contentId),
      toggleFavorite,
    }),
    [favoriteIds, loaded, toggleFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
}
