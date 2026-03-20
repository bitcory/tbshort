// ============================================
// 레이아웃 상수 (1080x1920)
// ============================================
export const LAYOUT = {
  WIDTH: 1080,
  HEIGHT: 1920,
  // 세이프 영역: ~130px ~ ~1700px (릴스/쇼츠 데드존 가이드 기준)
  HEADING_TOP: 170,
  HEADING_HEIGHT: 160,
  VISUAL_TOP: 330,
  VISUAL_HEIGHT: 1080,
  SUBTITLE_TOP: 1430,
  SUBTITLE_HEIGHT: 250,
  WATERMARK_TOP: 170,
} as const;

// ============================================
// 테마 컬러 시스템
// ============================================
export interface ThemeColors {
  bg: string;
  card: string;
  border: string;
  text: string;
  subtext: string;
  accent: string;
  codeBlockBg: string;
  codeBlockBar: string;
  codeBlockBorder: string;
  codeBlockText: string;
  codeBlockMeta: string;
}

export const THEMES: Record<"dark" | "light", ThemeColors> = {
  dark: {
    bg: "#111111",
    card: "#1A1A1A",
    border: "#2A2A2A",
    text: "#F5F5F5",
    subtext: "#888888",
    accent: "#A0A0A0",
    codeBlockBg: "#0D1117",
    codeBlockBar: "#161B22",
    codeBlockBorder: "#30363D",
    codeBlockText: "#E6EDF3",
    codeBlockMeta: "#8B949E",
  },
  light: {
    bg: "#FAFAFA",
    card: "#FFFFFF",
    border: "#E0E0E0",
    text: "#1A1A1A",
    subtext: "#777777",
    accent: "#666666",
    codeBlockBg: "#F6F8FA",
    codeBlockBar: "#EAECEF",
    codeBlockBorder: "#D0D7DE",
    codeBlockText: "#24292F",
    codeBlockMeta: "#656D76",
  },
};

export function getThemeColors(theme?: "dark" | "light"): ThemeColors {
  return THEMES[theme ?? "dark"];
}

// 하위호환: 기존 COLORS 유지
export const COLORS = THEMES.dark;
