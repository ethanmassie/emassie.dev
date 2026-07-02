const THEME_STORAGE_KEY = 'theme-override';
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';
const THEMES = [
  DARK_THEME,
  LIGHT_THEME,
]
const DEFAULT_THEME = DARK_THEME;

function isValidTheme(theme: string): boolean {
  return THEMES.includes(theme);
}

function setTheme(theme: string) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
}

function initTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme && isValidTheme(storedTheme)) {
    setTheme(storedTheme);
    return;
  }
  
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

  if (prefersLight) {
    setTheme(LIGHT_THEME);
    return;
  }

  setTheme(DEFAULT_THEME);
}

initTheme();
