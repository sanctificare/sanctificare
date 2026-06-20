export type TemplateType = "classico" | "moderno" | "tradicional" | "minimalista";

export interface TemplateTheme {
  id: TemplateType;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
  };
  fonts: {
    display: string;
    serif: string;
    sans: string;
  };
  preview: {
    bgColor: string;
    textColor: string;
    accentColor: string;
  };
}

export const templates: Record<TemplateType, TemplateTheme> = {
  classico: {
    id: "classico",
    name: "Clássico",
    description: "Azul marinho profundo com dourado litúrgico — elegância tradicional",
    colors: {
      primary: "oklch(0.22 0.07 260)",
      secondary: "oklch(0.75 0.12 75)",
      accent: "oklch(0.88 0.08 80)",
      background: "oklch(0.98 0.005 85)",
      foreground: "oklch(0.15 0.02 260)",
      muted: "oklch(0.50 0.02 260)",
    },
    fonts: {
      display: "Cinzel",
      serif: "Cormorant Garamond",
      sans: "Inter",
    },
    preview: {
      bgColor: "#1a3a52",
      textColor: "#ffd700",
      accentColor: "#e6c200",
    },
  },

  moderno: {
    id: "moderno",
    name: "Moderno",
    description: "Roxo místico com prata — design contemporâneo e sofisticado",
    colors: {
      primary: "oklch(0.28 0.08 280)",
      secondary: "oklch(0.78 0.08 280)",
      accent: "oklch(0.90 0.05 280)",
      background: "oklch(0.99 0.002 0)",
      foreground: "oklch(0.12 0.02 280)",
      muted: "oklch(0.55 0.02 280)",
    },
    fonts: {
      display: "Cinzel",
      serif: "Cormorant Garamond",
      sans: "Inter",
    },
    preview: {
      bgColor: "#4a3a7a",
      textColor: "#d4af37",
      accentColor: "#e6d5ff",
    },
  },

  tradicional: {
    id: "tradicional",
    name: "Tradicional",
    description: "Vinho bordô com ouro antigo — reverência e profundidade",
    colors: {
      primary: "oklch(0.30 0.12 15)",
      secondary: "oklch(0.65 0.15 60)",
      accent: "oklch(0.85 0.10 70)",
      background: "oklch(0.97 0.01 85)",
      foreground: "oklch(0.18 0.04 15)",
      muted: "oklch(0.55 0.05 30)",
    },
    fonts: {
      display: "Cinzel",
      serif: "Cormorant Garamond",
      sans: "Inter",
    },
    preview: {
      bgColor: "#5c2e3a",
      textColor: "#c9a961",
      accentColor: "#d4a574",
    },
  },

  minimalista: {
    id: "minimalista",
    name: "Minimalista",
    description: "Cinza e verde-oliva — simplicidade e serenidade",
    colors: {
      primary: "oklch(0.35 0.04 260)",
      secondary: "oklch(0.60 0.08 140)",
      accent: "oklch(0.75 0.10 140)",
      background: "oklch(0.99 0.001 0)",
      foreground: "oklch(0.20 0.02 260)",
      muted: "oklch(0.65 0.02 260)",
    },
    fonts: {
      display: "Cinzel",
      serif: "Cormorant Garamond",
      sans: "Inter",
    },
    preview: {
      bgColor: "#5a6b5b",
      textColor: "#9ab89a",
      accentColor: "#b8d4b8",
    },
  },
};

export function getTemplateTheme(templateId: TemplateType): TemplateTheme {
  return templates[templateId] || templates.classico;
}

export function applyTemplateTheme(templateId: TemplateType) {
  const theme = getTemplateTheme(templateId);
  const root = document.documentElement;

  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });

  // Atualizar CSS variables para o tema
  root.style.setProperty("--primary", theme.colors.primary);
  root.style.setProperty("--primary-foreground", theme.colors.accent);
  root.style.setProperty("--secondary", theme.colors.secondary);
  root.style.setProperty("--secondary-foreground", theme.colors.primary);
  root.style.setProperty("--accent", theme.colors.accent);
  root.style.setProperty("--accent-foreground", theme.colors.primary);
  root.style.setProperty("--background", theme.colors.background);
  root.style.setProperty("--foreground", theme.colors.foreground);
  root.style.setProperty("--muted", theme.colors.muted);
}
