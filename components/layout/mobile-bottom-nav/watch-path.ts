/** True for movie + series watch routes. */
export function isWatchPath(pathname: string) {
  return pathname === "/watch" || pathname.startsWith("/watch/");
}
