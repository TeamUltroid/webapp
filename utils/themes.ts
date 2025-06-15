export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    border: string;
  };
  gradients: {
    primary: string;
    surface: string;
    accent: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: "midnight_pro",
    name: "Midnight Pro",
    description: "Professional dark theme with subtle contrasts",
    colors: {
      primary: "#0ea5e9",
      background: "#0f172a",
      surface: "#1e293b",
      text: "#f8fafc",
      textSecondary: "#94a3b8",
      accent: "#0284c7",
      success: "#059669",
      warning: "#d97706",
      error: "#dc2626",
      border: "rgba(148, 163, 184, 0.2)"
    },    gradients: {
      primary: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
      surface: "none",
      accent: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)"
    },    shadows: {
      small: "0 2px 8px rgba(15, 23, 42, 0.4)",
      medium: "0 4px 16px rgba(15, 23, 42, 0.5)",
      large: "0 8px 32px rgba(15, 23, 42, 0.6)"
    }
  },
  {
    id: "cyber_teal",
    name: "Cyber Teal",
    description: "Futuristic teal theme with cyber aesthetics",
    colors: {
      primary: "#14b8a6",
      background: "#0c1415",
      surface: "#1f2937",
      text: "#e5e7eb",
      textSecondary: "#6ee7b7",
      accent: "#0d9488",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      border: "rgba(110, 231, 183, 0.15)"
    },
    gradients: {
      primary: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
      surface: "none",
      accent: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)"
    },
    shadows: {
      small: "0 2px 8px rgba(12, 20, 21, 0.4)",
      medium: "0 4px 16px rgba(12, 20, 21, 0.5)",
      large: "0 8px 32px rgba(12, 20, 21, 0.6)"
    }
  },
  {
    id: "slate_noir",
    name: "Slate Noir",
    description: "Elegant slate theme with sophisticated contrasts",
    colors: {
      primary: "#64748b",
      background: "#0f1419",
      surface: "#1e2432",
      text: "#f1f5f9",
      textSecondary: "#94a3b8",
      accent: "#475569",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      border: "rgba(148, 163, 184, 0.15)"
    },
    gradients: {
      primary: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
      surface: "none",
      accent: "linear-gradient(135deg, #475569 0%, #334155 100%)"
    },
    shadows: {
      small: "0 2px 8px rgba(15, 20, 25, 0.4)",
      medium: "0 4px 16px rgba(15, 20, 25, 0.5)",
      large: "0 8px 32px rgba(15, 20, 25, 0.6)"
    }
  },  {
    id: "deep_purple",
    name: "Deep Purple",
    description: "Bold and classy purple theme with royal elegance",
    colors: {
      primary: "#9333ea",
      background: "#0f0a1a",
      surface: "#1a0f2e",
      text: "#ffffff",
      textSecondary: "#d8b4fe",
      accent: "#a855f7",
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
      border: "rgba(168, 85, 247, 0.25)"
    },
    gradients: {
      primary: "linear-gradient(135deg, #9333ea 0%, #a855f7 100%)",
      surface: "linear-gradient(135deg, rgba(26, 15, 46, 0.9) 0%, rgba(15, 10, 26, 0.95) 100%)",
      accent: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)"
    },
    shadows: {
      small: "0 2px 8px rgba(147, 51, 234, 0.3)",
      medium: "0 4px 16px rgba(147, 51, 234, 0.4)",
      large: "0 8px 32px rgba(147, 51, 234, 0.5)"
    }
  },
  {
    id: "warm_amber",
    name: "Warm Amber",
    description: "Cozy amber theme with warm, inviting tones",
    colors: {
      primary: "#f59e0b",
      background: "#1c1917",
      surface: "#292524",
      text: "#fef7f0",
      textSecondary: "#fbbf24",
      accent: "#d97706",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      border: "rgba(251, 191, 36, 0.2)"
    },    gradients: {
      primary: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      surface: "linear-gradient(135deg, rgba(41, 37, 36, 0.8) 0%, rgba(28, 25, 23, 0.9) 100%)",
      accent: "linear-gradient(135deg, #d97706 0%, #b45309 100%)"
    },
    shadows: {
      small: "0 2px 8px rgba(28, 25, 23, 0.4)",
      medium: "0 4px 16px rgba(28, 25, 23, 0.5)",
      large: "0 8px 32px rgba(28, 25, 23, 0.6)"
    }
  }
];


export const getThemeById = (id: string): Theme => {
  return THEMES.find(theme => theme.id === id) || THEMES[0];
};

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  
  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
    }
    return '0, 0, 0';
  };
  
  // Apply CSS custom properties
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--color-${cssKey}`, value);
    
    // Also set RGB values for gradient animations
    if (typeof value === 'string' && value.startsWith('#')) {
      root.style.setProperty(`--color-${cssKey}-rgb`, hexToRgb(value));
    }
  });
  
  Object.entries(theme.gradients).forEach(([key, value]) => {
    root.style.setProperty(`--gradient-${key}`, value);
  });
  
  Object.entries(theme.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value);
  });
};
