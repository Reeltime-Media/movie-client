/**
 * Blocking bootstrap for theme + locale on <html>.
 * Must run before paint (inline in layout) — not during React render —
 * so SSR HTML and the client's first paint stay aligned.
 */
export const THEME_LOCALE_BOOTSTRAP = `(function(){try{var t=localStorage.getItem("reeltime-theme");document.documentElement.dataset.theme=(t==="light"||t==="dark")?t:"dark";var l=localStorage.getItem("reeltime-locale");document.documentElement.lang=l==="km"?"km":"en";}catch(e){document.documentElement.dataset.theme="dark";}})();`;
