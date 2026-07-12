/** DOM play() rejects with AbortError when src/load changes mid-request — safe to ignore. */
function isBenignPlayError(err: unknown): boolean {
  if (!(err instanceof DOMException)) return false;
  return err.name === "AbortError" || err.name === "NotAllowedError";
}

/** Calls video.play() and swallows benign interruption / autopolicy errors. */
export function safePlay(video: HTMLVideoElement): Promise<void> {
  const result = video.play();
  if (result === undefined) return Promise.resolve();
  return result.catch((err: unknown) => {
    if (!isBenignPlayError(err)) throw err;
  });
}
