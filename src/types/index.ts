// ============================================
// aitoolbee-shorts 타입 정의
// ============================================

export type VisualType =
  | "step-flow"
  | "code-block"
  | "comparison"
  | "numbered-list"
  | "bar-chart"
  | "keyword-highlight"
  | "icon-text"
  | "checklist"
  | "quote-card"
  | "tip-card"
  | "timeline"
  | "stats-card"
  | "image-caption"
  | "none";

export type SceneType = "intro" | "tip" | "outro";

export type ThemeType = "dark" | "light";

export interface Visual {
  type: VisualType;
  data: Record<string, unknown>; // 각 컴포넌트별 데이터
}

export interface Scene {
  id: string;
  type: SceneType;
  heading: string;
  narration: string; // 50자 이내 권장 (약 5~7초 분량)
  visual: Visual;
  durationSec?: number; // TTS 생성 후 자동 계산
}

export interface Script {
  topic: string;
  title: string;
  totalDurationSec?: number;
  characterDescription?: string;
  theme?: ThemeType;
  voice?: string;
  font?: string;
  scenes: Scene[];
}

export interface TTSResult {
  sceneId: string;
  audioPath: string;
  durationMs: number;
  timestamps: WordTimestamp[];
}

export interface WordTimestamp {
  text: string;
  startMs: number;
  endMs: number;
}

export interface RenderConfig {
  script: Script;
  ttsResults: TTSResult[];
  outputPath: string;
  fps: number;
  width: number;
  height: number;
}

// ============================================
// Visual 데이터 타입 (각 컴포넌트별)
// ============================================

export interface StepFlowData {
  steps: { label: string; icon?: string }[];
  activeStep?: number;
}

export interface CodeBlockData {
  language: string;
  code: string;
  highlightLines?: number[];
}

export interface ComparisonData {
  leftLabel: string;
  rightLabel: string;
  items: { left: string; right: string }[];
}

export interface NumberedListData {
  items: string[];
}

export interface BarChartData {
  items: { label: string; value: number; color?: string }[];
  maxValue?: number;
}

export interface KeywordHighlightData {
  text: string;
  keywords: string[];
}

export interface ChecklistData {
  items: { text: string; checked: boolean }[];
}

export interface QuoteCardData {
  quote: string;
  author?: string;
}

export interface TipCardData {
  number: number;
  title: string;
  description: string;
  emoji?: string;
}

export interface StatsCardData {
  stats: { value: string; label: string; color?: string }[];
}

export interface ImageCaptionData {
  imagePrompt: string;
  caption: string;
  imagePath?: string;
}
