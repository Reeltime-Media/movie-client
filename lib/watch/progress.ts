export const MIN_WATCH_SECONDS = 30;
export const MIN_WATCH_RATIO = 0.1;
export const WATCH_COMPLETED_RATIO = 0.9;
export const WATCH_PROGRESS_SAVE_INTERVAL_MS = 20_000;

export function qualifiesAsWatch(positionSeconds: number, durationSeconds: number): boolean {
  if (positionSeconds >= MIN_WATCH_SECONDS) return true;
  if (durationSeconds > 0 && positionSeconds / durationSeconds >= MIN_WATCH_RATIO) {
    return true;
  }
  return false;
}

export function isWatchCompleted(positionSeconds: number, durationSeconds: number): boolean {
  if (durationSeconds <= 0) return false;
  return positionSeconds / durationSeconds >= WATCH_COMPLETED_RATIO;
}
