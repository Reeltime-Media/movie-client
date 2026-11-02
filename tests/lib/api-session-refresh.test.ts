import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/core/resolve-api-url", () => ({ resolveApiUrl: () => "https://api.test" }));

const store = new Map<string, string>();
const assign = vi.fn();

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function authHeader(call: unknown[]): string | undefined {
  const init = call[1] as RequestInit;
  return (init.headers as Record<string, string>).Authorization;
}

async function loadClient() {
  vi.resetModules();
  return import("@/lib/api/core/client");
}

beforeEach(() => {
  store.clear();
  assign.mockReset();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
  vi.stubGlobal("window", {
    location: { pathname: "/library", search: "", assign },
    addEventListener: () => {},
    removeEventListener: () => {},
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch session refresh", () => {
  it("swaps an expired token for a new one and retries", async () => {
    store.set("rt_token", "old");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json(401, { detail: "expired" }))
      .mockResolvedValueOnce(json(200, { access_token: "new" }))
      .mockResolvedValueOnce(json(200, { ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    const { apiFetch } = await loadClient();

    await expect(apiFetch("/users/me")).resolves.toEqual({ ok: true });

    expect(fetchMock.mock.calls[1][0]).toBe("https://api.test/auth/refresh");
    expect(authHeader(fetchMock.mock.calls[2])).toBe("Bearer new");
    expect(store.get("rt_token")).toBe("new");
    expect(assign).not.toHaveBeenCalled();
  });

  it("signs out when the session was revoked", async () => {
    store.set("rt_token", "old");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(json(401, { detail: "expired" }))
        .mockResolvedValueOnce(json(401, { detail: "revoked" })),
    );
    const { apiFetch } = await loadClient();

    await expect(apiFetch("/users/me")).rejects.toMatchObject({ status: 401 });

    expect(store.has("rt_token")).toBe(false);
    expect(assign).toHaveBeenCalledWith("/login?next=%2Flibrary");
  });

  it("keeps the login when the API can't answer the refresh", async () => {
    store.set("rt_token", "old");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(json(401, { detail: "expired" }))
        .mockResolvedValueOnce(json(503, { detail: "down" })),
    );
    const { apiFetch } = await loadClient();

    await expect(apiFetch("/users/me")).rejects.toMatchObject({ status: 503 });

    expect(store.get("rt_token")).toBe("old");
    expect(assign).not.toHaveBeenCalled();
  });

  it("refreshes once for requests that fail together", async () => {
    store.set("rt_token", "old");
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      if (url.endsWith("/auth/refresh")) return json(200, { access_token: "new" });
      const auth = (init.headers as Record<string, string>).Authorization;
      return auth === "Bearer new" ? json(200, { ok: true }) : json(401, { detail: "expired" });
    });
    vi.stubGlobal("fetch", fetchMock);
    const { apiFetch } = await loadClient();

    await Promise.all([apiFetch("/a"), apiFetch("/b")]);

    const refreshes = fetchMock.mock.calls.filter(([url]) => url.endsWith("/auth/refresh"));
    expect(refreshes).toHaveLength(1);
  });

  it("sends watch progress as a JSON object", async () => {
    store.set("rt_token", "t");
    const fetchMock = vi.fn().mockResolvedValueOnce(json(200, {}));
    vi.stubGlobal("fetch", fetchMock);
    vi.resetModules();
    const { upsertWatchProgress } = await import("@/lib/api/playback/watch-progress");

    await upsertWatchProgress("c1", { position_seconds: 90, completed: false });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(init.body as string)).toEqual({ position_seconds: 90, completed: false });
  });

  it("does not refresh for a failed login", async () => {
    store.set("rt_token", "old");
    const fetchMock = vi.fn().mockResolvedValueOnce(json(401, { detail: "bad password" }));
    vi.stubGlobal("fetch", fetchMock);
    const { apiFetch } = await loadClient();

    await expect(apiFetch("/auth/login")).rejects.toMatchObject({ status: 401 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(assign).not.toHaveBeenCalled();
  });
});
