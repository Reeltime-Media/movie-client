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

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { loggedIn } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loggedIn) {
      setFavoriteIds(new Set());
      setLoaded(true);
      return;
    }
    let cancelled = false;
    setLoaded(false);
    listFavorites()
      .then((rows) => {
        if (cancelled) return;
        setFavoriteIds(new Set(rows.map((r) => r.content_id)));
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  const toggleFavorite = useCallback(
    async (contentId: string) => {
      if (!loggedIn) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      let wasFavorite = false;
      setFavoriteIds((prev) => {
        wasFavorite = prev.has(contentId);
        const next = new Set(prev);
        if (wasFavorite) next.delete(contentId);
        else next.add(contentId);
        return next;
      });
      try {
        if (wasFavorite) await removeFavorite(contentId);
        else await addFavorite(contentId);
      } catch {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
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
