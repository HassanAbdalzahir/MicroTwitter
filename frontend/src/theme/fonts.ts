export const fonts = {
  sans: {
    family: "Arial, Helvetica, sans-serif",
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  mono: {
    family: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
    },
  },
} as const;

export type FontFamily = keyof typeof fonts;
export type FontWeight =
  (typeof fonts)["sans"]["weights"][keyof (typeof fonts)["sans"]["weights"]];
