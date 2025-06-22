export const colors = {
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
  success: {
    light: "#86efac",
    DEFAULT: "#22c55e",
    dark: "#15803d",
  },
  error: {
    light: "#fca5a5",
    DEFAULT: "#ef4444",
    dark: "#b91c1c",
  },
  background: {
    light: "#ffffff",
    dark: "#0a0a0a",
  },
  text: {
    light: "#171717",
    dark: "#ededed",
  },
} as const;

export type ColorKey = keyof typeof colors;
export type ColorShade = keyof typeof colors.primary;
