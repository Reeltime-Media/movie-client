import { NextRequest, NextResponse } from "next/server";

// This proxy forwards arbitrary, often per-user Authorization-bearing
// requests (auth, favorites, etc.) — it must never be cached or served
// stale, for any path or method.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

function apiProxyTarget(): string | null {
  const raw = process.env.API_PROXY_TARGET?.trim().replace(/\/$/, "");
  return raw || null;
}

async function proxyToApi(request: NextRequest, pathSegments: string[]) {
  const base = apiProxyTarget();
  if (!base) {
    return NextResponse.json({ detail: "API proxy is not configured" }, { status: 502 });
  }

  const pathname = pathSegments.map(encodeURIComponent).join("/");
  const targetUrl = `${base}/${pathname}${request.nextUrl.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!HOP_BY_HOP_HEADERS.has(lower)) {
      headers.set(key, value);
    }
  });

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "follow",
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetch(targetUrl, init);
  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });
  // Override whatever (or no) cache header the upstream sent — never let a
  // browser or CDN cache a per-user, auth-sensitive proxy response.
  responseHeaders.set("Cache-Control", "no-store, must-revalidate");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyToApi(request, path);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
