export type Locale = "en" | "km";

export const LOCALE_STORAGE_KEY = "reeltime-locale";

const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach((fn) => fn());
}

export function subscribeLocale(onStoreChange: () => void) {
  subscribers.add(onStoreChange);
  function onStorage(e: StorageEvent) {
    if (e.key === LOCALE_STORAGE_KEY) onStoreChange();
  }
  function onCustom() {
    onStoreChange();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener("reeltime-locale", onCustom);
  return () => {
    subscribers.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("reeltime-locale", onCustom);
  };
}

export function getServerLocaleSnapshot(): Locale {
  return "en";
}

export function getLocaleSnapshot(): Locale {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    return raw === "km" ? "km" : "en";
  } catch {
    return "en";
  }
}

export function applyLocale(next: Locale) {
  document.documentElement.lang = next === "km" ? "km" : "en";
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("reeltime-locale"));
  notify();
}
