(() => {
  if (window.__animeBgInit) return;
  window.__animeBgInit = true;

  const DESKTOP_SOURCES = [
    'https://t.alcy.cc/ycy',
    'https://t.alcy.cc/moe',
    'https://t.alcy.cc/fj',
  ];
  const MOBILE_SOURCES = [
    'https://t.alcy.cc/ycy',
    'https://t.alcy.cc/moemp',
    'https://t.alcy.cc/mp',
  ];

  const CACHE_URL_KEY = 'anime_bg_url';
  const CACHE_TIME_KEY = 'anime_bg_time';
  const CACHE_SOURCE_KEY = 'anime_bg_source';
  const CACHE_HOURS = 4;
  const MAX_RETRY = 3;

  const hasStorage = (() => {
    try {
      const key = '__anime_bg_probe__';
      window.localStorage.setItem(key, '1');
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  })();

  const readStorage = (key) => hasStorage ? window.localStorage.getItem(key) : null;
  const writeStorage = (key, value) => {
    if (!hasStorage) return;
    window.localStorage.setItem(key, value);
  };

  function isCacheExpired() {
    const saved = readStorage(CACHE_TIME_KEY);
    if (!saved) return true;
    const savedAt = Number(saved);
    if (!Number.isFinite(savedAt)) return true;
    return (Date.now() - savedAt) > CACHE_HOURS * 60 * 60 * 1000;
  }

  function isMobile() {
    return window.matchMedia('(max-width: 680px)').matches;
  }

  function listSources() {
    return isMobile() ? MOBILE_SOURCES : DESKTOP_SOURCES;
  }

  function pickSource() {
    const sources = listSources();
    const cachedSource = readStorage(CACHE_SOURCE_KEY);
    if (cachedSource && sources.includes(cachedSource)) return cachedSource;
    return sources[Math.floor(Math.random() * sources.length)];
  }

  function requestUrl(source) {
    const sep = source.includes('?') ? '&' : '?';
    return `${source}${sep}_t=${Date.now()}`;
  }

  function applyBackground(url) {
    const el = document.getElementById('anime-bg');
    if (!el) return;
    el.style.backgroundImage = `url("${url}")`;
    el.classList.add('is-ready');
  }

  function preload(url, onSuccess, onError) {
    const img = new Image();
    img.onload = onSuccess;
    img.onerror = onError;
    img.src = url;
  }

  function refreshBackground(retriesLeft) {
    const source = pickSource();
    const url = requestUrl(source);

    preload(
      url,
      () => {
        writeStorage(CACHE_URL_KEY, url);
        writeStorage(CACHE_SOURCE_KEY, source);
        writeStorage(CACHE_TIME_KEY, String(Date.now()));
        applyBackground(url);
      },
      () => {
        if (retriesLeft > 0) refreshBackground(retriesLeft - 1);
      },
    );
  }

  function initAnimeBackground() {
    const cachedUrl = readStorage(CACHE_URL_KEY);
    if (cachedUrl) applyBackground(cachedUrl);
    if (!cachedUrl || isCacheExpired()) refreshBackground(MAX_RETRY);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimeBackground, { once: true });
  } else {
    initAnimeBackground();
  }
})();
