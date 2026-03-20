// 기존 타입 정의를 직접 포함 (Next.js 빌드 안정성을 위해)
// 원본: ../../src/types/index.ts

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
  data: Record<string, unknown>;
}

export interface Scene {
  id: string;
  type: SceneType;
  heading: string;
  narration: string;
  visual: Visual;
  durationSec?: number;
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

// Job 상태 타입
export type JobStatus = "pending" | "running" | "completed" | "error";

export interface Job {
  id: string;
  type: "tts" | "render";
  status: JobStatus;
  progress?: string;
  result?: unknown;
  error?: string;
  createdAt: number;
}
