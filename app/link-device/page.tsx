"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmDevicePairing } from "@/lib/api/auth";
import { useAuth } from "@/hooks/auth/use-auth";
import { pageTitleClassName } from "@/lib/ui/page-title";
import { clearToken } from "@/lib/auth/token";
import { loginPathWithNext } from "@/lib/auth-redirect";
import { CheckoutSpinner } from "@/components/pay/CheckoutSpinner";

type Status = "idle" | "confirming" | "done" | "error";

function LinkDeviceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loggedIn } = useAuth();
  const code = searchParams.get("code");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (!code) return;
    if (!loggedIn) {
      router.replace(`/login?next=${encodeURIComponent(`/link-device?code=${code}`)}`);
      return;
    }
    if (ran.current) return;
    ran.current = true;
    setStatus("confirming");
    confirmDevicePairing(code)
      .then(() => setStatus("done"))
      .catch((err) => {
        const status = err && typeof err === "object" && "status" in err
          ? (err as { status?: number }).status
          : undefined;
        if (status === 401) {
          clearToken();
          router.replace(loginPathWithNext(`/link-device?code=${code}`));
          return;
        }
        setError(err instanceof Error ? err.message : "Couldn't sign in the TV.");
        setStatus("error");
      });
  }, [code, loggedIn, router]);

  if (!code) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-6 text-center">
        <p className="text-sm text-text-muted">
          Missing pairing code. Scan the QR code shown on your TV again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      {status === "done" ? (
        <>
          <h1 className={pageTitleClassName}>TV signed in</h1>
          <p className="text-sm text-text-muted">
            You can put your phone away — your TV is ready.
          </p>
        </>
      ) : status === "error" ? (
        <>
          <h1 className={pageTitleClassName}>Couldn&apos;t sign in the TV</h1>
          <p className="text-sm text-danger">{error}</p>
        </>
      ) : (
        <>
          <h1 className={pageTitleClassName}>Signing in your TV…</h1>
          <p className="text-sm text-text-muted">Hang on a moment.</p>
        </>
      )}
    </div>
  );
}

export default function LinkDevicePage() {
  return (
    <Suspense fallback={<CheckoutSpinner />}>
      <LinkDeviceContent />
    </Suspense>
  );
}
