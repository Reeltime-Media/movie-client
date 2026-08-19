"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getMyRating, rateMovie } from "@/lib/api/ratings";
import { useAuth } from "@/hooks/auth/use-auth";
import { useI18n } from "@/components/providers/LocaleProvider";
import { loginPathWithNext } from "@/lib/auth-redirect";

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

type RatingStarProps = {
  value: number;
  filled: boolean;
  checked: boolean;
  disabled: boolean;
  label: string;
  onHover: (value: number) => void;
  onHoverEnd: () => void;
  onRate: (value: number) => void;
};

function RatingStar({
  value,
  filled,
  checked,
  disabled,
  label,
  onHover,
  onHoverEnd,
  onRate,
}: RatingStarProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={label}
      onMouseEnter={() => onHover(value)}
      onFocus={() => onHover(value)}
      onBlur={onHoverEnd}
      onClick={() => onRate(value)}
      disabled={disabled}
      className="cursor-pointer p-0.5 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Star
        size={18}
        className={filled ? "fill-warning text-warning" : "fill-transparent text-border-hover"}
        aria-hidden
      />
    </button>
  );
}

type RatingInputProps = {
  contentId: string;
  onAggregateChange?: (rating: string | null) => void;
};

export function RatingInput({ contentId, onAggregateChange }: RatingInputProps) {
  const { t } = useI18n();
  const { loggedIn } = useAuth();
  const pathname = usePathname();
  const loginHref = loginPathWithNext(pathname || "/");

  const [myRating, setMyRating] = useState<number | null>(null);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when switching to a different movie (adjust-state-during-render pattern).
  const [prevContentId, setPrevContentId] = useState(contentId);
  if (prevContentId !== contentId) {
    setPrevContentId(contentId);
    setMyRating(null);
    setError(null);
  }

  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;
    getMyRating(contentId)
      .then((res) => {
        if (!cancelled) setMyRating(res?.value ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [contentId, loggedIn]);

  function handleRate(value: number) {
    if (!loggedIn) {
      window.location.href = loginHref;
      return;
    }
    if (submitting) return;

    const prevValue = myRating;
    setMyRating(value);
    setSubmitting(true);
    setError(null);

    rateMovie(contentId, value as 1 | 2 | 3 | 4 | 5)
      .then((res) => {
        onAggregateChange?.(res.content_rating);
      })
      .catch(() => {
        setMyRating(prevValue);
        setError(t("ratingSubmitError"));
      })
      .finally(() => setSubmitting(false));
  }

  const displayValue = hoverValue ?? myRating ?? 0;

  return (
    <div className="mt-4">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-text-disabled">
        {t("ratingLabel")}
      </span>
      {loggedIn ? (
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="radiogroup"
            aria-label={t("ratingLabel")}
            className="flex items-center gap-0.5"
            onMouseLeave={() => setHoverValue(null)}
          >
            {STAR_VALUES.map((value) => (
              <RatingStar
                key={value}
                value={value}
                filled={value <= displayValue}
                checked={myRating === value}
                disabled={submitting}
                label={t("ratingStarLabel").replace("{n}", String(value))}
                onHover={setHoverValue}
                onHoverEnd={() => setHoverValue(null)}
                onRate={handleRate}
              />
            ))}
          </div>
          {myRating ? (
            <span className="text-[12px] font-medium text-text-muted">
              {t("ratingYourScore").replace("{n}", String(myRating))}
            </span>
          ) : null}
        </div>
      ) : (
        <p className="text-[12px] text-text-muted">
          <Link href={loginHref} className="font-semibold text-brand hover:underline">
            {t("ratingSignInLink")}
          </Link>{" "}
          {t("ratingSignInSuffix")}
        </p>
      )}
      {error ? (
        <p className="mt-1 text-[12px] text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
