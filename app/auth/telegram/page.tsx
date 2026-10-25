"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void;
  }
}

function TelegramAuthBridge() {
  const searchParams = useSearchParams();
  const nonce = (searchParams.get("nonce") || "").trim();
  const botFromQuery = (searchParams.get("bot") || "").trim().replace(/^@/, "");
  const botUsername =
    botFromQuery ||
    (process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "").trim().replace(/^@/, "");

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Waiting for Telegram…");

  const ready = useMemo(() => Boolean(nonce && botUsername), [nonce, botUsername]);
  // A missing nonce/bot is known at render time — derive it rather than set it in the effect.
  const shownError = ready
    ? error
    : "Missing Telegram login session. Return to the app and try again.";

  useEffect(() => {
    if (!ready) return;

    window.onTelegramAuth = (user: TelegramUser) => {
      try {
        const params = new URLSearchParams({
          nonce,
          id: String(user.id),
          auth_date: String(user.auth_date),
          hash: user.hash,
        });
        if (user.first_name) params.set("first_name", user.first_name);
        if (user.last_name) params.set("last_name", user.last_name);
        if (user.username) params.set("username", user.username);
        if (user.photo_url) params.set("photo_url", user.photo_url);

        setStatus("Returning to REELTIME…");
        // Custom scheme deep link into the phone app.
        // Three slashes → empty host so Flutter/GoRouter sees path /auth/telegram.
        window.location.href = `reeltime:///auth/telegram?${params.toString()}`;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not finish Telegram sign-in.");
      }
    };

    const existing = document.getElementById("telegram-login-script");
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.id = "telegram-login-script";
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");

    const mount = document.getElementById("telegram-login-mount");
    if (mount) {
      mount.innerHTML = "";
      mount.appendChild(script);
    }

    return () => {
      delete window.onTelegramAuth;
    };
  }, [ready, nonce, botUsername]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-text">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface px-6 py-8 text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-sm bg-brand text-lg font-black text-white">
          R
        </div>
        <h1 className="text-lg font-bold tracking-wide text-white">Continue with Telegram</h1>
        <p className="mt-2 text-[13px] text-text-muted">
          Sign in with Telegram, then we will send you back to the REELTIME app.
        </p>

        {shownError ? (
          <p className="mt-6 rounded-md border border-danger/30 bg-danger/10 px-3 py-2.5 text-[12px] font-medium text-danger">
            {shownError}
          </p>
        ) : (
          <>
            <p className="mt-6 text-[12px] text-text-muted">{status}</p>
            <div id="telegram-login-mount" className="mt-4 flex justify-center" />
          </>
        )}
      </div>
    </main>
  );
}

export default function TelegramAuthPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-bg text-text-muted">
          Loading…
        </main>
      }
    >
      <TelegramAuthBridge />
    </Suspense>
  );
}
