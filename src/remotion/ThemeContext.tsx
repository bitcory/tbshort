import React, { createContext, useContext, useMemo } from "react";
import { staticFile } from "remotion";
import { getThemeColors, type ThemeColors } from "./constants";

// ============================================
// 폰트 정의 (Remotion 빌드용 — web/lib/constants.ts 와 동기화)
// ============================================
const FONT_FILES: Record<string, string> = {
  Pretendard: "Pretendard-Regular.otf",
  Paperlogy: "Paperlogy-7Bold.ttf",
  BlackHanSans: "BlackHanSans-Regular.ttf",
  Cafe24Ssurround: "Cafe24Ssurround-v2.0.ttf",
  GodoB: "GodoB.ttf",
  AritaBuriKR: "AritaBuriKR-SemiBold.ttf",
};

const DEFAULT_FONT = "Pretendard";

// ============================================
// Context
// ============================================
interface ThemeContextValue {
  colors: ThemeColors;
  fontFamily: string;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: getThemeColors("dark"),
  fontFamily: `"${DEFAULT_FONT}", sans-serif`,
});

export function ThemeProvider({
  theme,
  font,
  children,
}: {
  theme?: "dark" | "light";
  font?: string;
  children: React.ReactNode;
}) {
  const fontId = font && FONT_FILES[font] ? font : DEFAULT_FONT;

  const value = useMemo(
    () => ({
      colors: getThemeColors(theme),
      fontFamily: `"${fontId}", sans-serif`,
    }),
    [theme, fontId]
  );

  return (
    <ThemeContext.Provider value={value}>
      <FontLoader />
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeColors(): ThemeColors {
  return useContext(ThemeContext).colors;
}

export function useFontFamily(): string {
  return useContext(ThemeContext).fontFamily;
}

// ============================================
// @font-face 로더
// ============================================
function FontLoader() {
  const css = Object.entries(FONT_FILES)
    .map(
      ([name, file]) => `
@font-face {
  font-family: "${name}";
  src: url("${staticFile(`fonts/${file}`)}") format("${file.endsWith(".otf") ? "opentype" : "truetype"}");
  font-display: block;
}`
    )
    .join("\n");

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
