const THEME_KEY = "pennyplot-theme";
const ACCENT_KEY = "pennyplot-accent";

export const THEMES = {
  DARK: "dark",
  LIGHT: "light",
  SYSTEM: "system",
};

export const ACCENTS = {
  emerald: {
    name: "Emerald",
    value: "#4FAF7B",
  },
  blue: {
    name: "Blue",
    value: "#5B8DEF",
  },
  purple: {
    name: "Purple",
    value: "#9B7EDE",
  },
  orange: {
    name: "Orange",
    value: "#E89B5A",
  },
  rose: {
    name: "Rose",
    value: "#D8798B",
  },
};

export function getSavedTheme() {
  return localStorage.getItem(THEME_KEY) || THEMES.DARK;
}

export function getSavedAccent() {
  return localStorage.getItem(ACCENT_KEY) || "emerald";
}

export function getResolvedTheme(theme) {
  if (theme !== THEMES.SYSTEM) {
    return theme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? THEMES.DARK
    : THEMES.LIGHT;
}

export function applyTheme(theme) {
  const resolvedTheme = getResolvedTheme(theme);

  document.documentElement.classList.toggle(
    "dark",
    resolvedTheme === THEMES.DARK,
  );

  document.documentElement.classList.toggle(
    "light",
    resolvedTheme === THEMES.LIGHT,
  );

  localStorage.setItem(THEME_KEY, theme);
}

export function applyAccent(accentKey) {
  const accent = ACCENTS[accentKey] || ACCENTS.emerald;

  document.documentElement.style.setProperty(
    "--primary",
    accent.value,
  );

  document.documentElement.style.setProperty(
    "--ring",
    accent.value,
  );

  document.documentElement.style.setProperty(
    "--sidebar-primary",
    accent.value,
  );

  document.documentElement.style.setProperty(
    "--sidebar-ring",
    accent.value,
  );

  document.documentElement.style.setProperty(
    "--accent-color",
    accent.value,
  );

  localStorage.setItem(ACCENT_KEY, accentKey);
}

export function initializeTheme() {
  const theme = getSavedTheme();
  const accent = getSavedAccent();

  applyTheme(theme);
  applyAccent(accent);

  if (theme === THEMES.SYSTEM) {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    const handleSystemThemeChange = () => {
      applyTheme(THEMES.SYSTEM);
    };

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange,
      );
    };
  }

  return undefined;
}