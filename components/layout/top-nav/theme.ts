const themeSubscribers = new Set<() => void>();

export function resolveTheme(): "dark" | "light" {
  const explicit = document.documentElement.dataset.theme as "dark" | "light" | undefined;
  if (explicit === "dark" || explicit === "light") return explicit;
  return "dark";
}

export function subscribeTheme(onStoreChange: () => void) {
  themeSubscribers.add(onStoreChange);
  function onStorage(e: StorageEvent) {
    if (e.key === "reeltime-theme") onStoreChange();
  }
  window.addEventListener("storage", onStorage);
  return () => {
    themeSubscribers.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

function notifyThemeSubscribers() {
  themeSubscribers.forEach((fn) => fn());
}

function applyTheme(theme: "dark" | "light") {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("reeltime-theme", theme);
  } catch {
    /* ignore */
  }
  notifyThemeSubscribers();
}

export function toggleTheme() {
  applyTheme(resolveTheme() === "dark" ? "light" : "dark");
}
