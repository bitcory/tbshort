import type { VisualType } from "./types";

interface VisualMeta {
  label: string;
  description: string;
  fields: FieldDef[];
}

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "tags" | "items" | "code" | "comparison-items" | "checklist-items" | "step-items" | "bar-items" | "stat-items";
  placeholder?: string;
}

export const VISUAL_META: Record<VisualType, VisualMeta> = {
  "keyword-highlight": {
    label: "키워드 강조",
    description: "텍스트에서 키워드를 강조 표시",
    fields: [
      { key: "text", label: "텍스트", type: "textarea", placeholder: "강조할 텍스트 입력" },
      { key: "keywords", label: "키워드", type: "tags", placeholder: "키워드 추가" },
    ],
  },
  "step-flow": {
    label: "단계 흐름",
    description: "순서대로 진행되는 단계 표시",
    fields: [
      { key: "steps", label: "단계", type: "step-items" },
      { key: "activeStep", label: "활성 단계", type: "number", placeholder: "0" },
    ],
  },
  "code-block": {
    label: "코드 블록",
    description: "코드 예시 표시",
    fields: [
      { key: "language", label: "언어", type: "text", placeholder: "javascript" },
      { key: "code", label: "코드", type: "code", placeholder: "코드 입력" },
    ],
  },
  comparison: {
    label: "비교",
    description: "두 항목 비교",
    fields: [
      { key: "leftLabel", label: "왼쪽 라벨", type: "text", placeholder: "Before" },
      { key: "rightLabel", label: "오른쪽 라벨", type: "text", placeholder: "After" },
      { key: "items", label: "비교 항목", type: "comparison-items" },
    ],
  },
  "numbered-list": {
    label: "번호 목록",
    description: "번호가 매겨진 목록",
    fields: [
      { key: "items", label: "항목", type: "items", placeholder: "항목 추가" },
    ],
  },
  "bar-chart": {
    label: "막대 차트",
    description: "데이터 막대 차트",
    fields: [
      { key: "items", label: "데이터", type: "bar-items" },
    ],
  },
  "icon-text": {
    label: "아이콘 + 텍스트",
    description: "아이콘과 텍스트 조합",
    fields: [
      { key: "text", label: "텍스트", type: "textarea", placeholder: "텍스트 입력" },
    ],
  },
  checklist: {
    label: "체크리스트",
    description: "체크 목록",
    fields: [
      { key: "items", label: "항목", type: "checklist-items" },
    ],
  },
  "quote-card": {
    label: "인용 카드",
    description: "인용문 표시",
    fields: [
      { key: "quote", label: "인용문", type: "textarea", placeholder: "인용문 입력" },
      { key: "author", label: "작성자", type: "text", placeholder: "작성자 (선택)" },
    ],
  },
  "tip-card": {
    label: "팁 카드",
    description: "팁/조언 카드",
    fields: [
      { key: "number", label: "번호", type: "number", placeholder: "1" },
      { key: "title", label: "제목", type: "text", placeholder: "팁 제목" },
      { key: "description", label: "설명", type: "textarea", placeholder: "팁 설명" },
      { key: "emoji", label: "이모지", type: "text", placeholder: "💡" },
    ],
  },
  timeline: {
    label: "타임라인",
    description: "시간순 이벤트",
    fields: [
      { key: "items", label: "이벤트", type: "items", placeholder: "이벤트 추가" },
    ],
  },
  "stats-card": {
    label: "통계 카드",
    description: "주요 수치/통계 표시",
    fields: [
      { key: "stats", label: "통계", type: "stat-items" },
    ],
  },
  "image-caption": {
    label: "이미지 + 캡션",
    description: "이미지와 캡션 표시 (이미지 업로드 필요)",
    fields: [
      { key: "imagePrompt", label: "이미지 설명", type: "textarea", placeholder: "이미지 생성 프롬프트 또는 설명" },
      { key: "caption", label: "캡션", type: "text", placeholder: "이미지 하단 캡션" },
    ],
  },
  none: {
    label: "없음",
    description: "비주얼 없음",
    fields: [],
  },
};

// ============================================
// TTS 음성 목록 (edge-tts)
// ============================================
export interface VoiceOption {
  id: string;
  label: string;
  lang: "ko" | "en";
  gender: "F" | "M";
}

export const VOICE_OPTIONS: VoiceOption[] = [
  // 한국어
  { id: "ko-KR-SunHiNeural", label: "선히", lang: "ko", gender: "F" },
  { id: "ko-KR-InJoonNeural", label: "인준", lang: "ko", gender: "M" },
  { id: "ko-KR-HyunsuMultilingualNeural", label: "현수", lang: "ko", gender: "M" },
  // 영어
  { id: "en-US-AriaNeural", label: "Aria", lang: "en", gender: "F" },
  { id: "en-US-GuyNeural", label: "Guy", lang: "en", gender: "M" },
  { id: "en-US-DavisNeural", label: "Davis", lang: "en", gender: "M" },
];

export const DEFAULT_VOICE = "ko-KR-SunHiNeural";

// ============================================
// 폰트 목록
// ============================================
export interface FontOption {
  id: string;
  label: string;
  file: string;
  style: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { id: "Pretendard", label: "프리텐다드", file: "Pretendard-Regular.otf", style: "깔끔" },
  { id: "Paperlogy", label: "페이퍼로지", file: "Paperlogy-7Bold.ttf", style: "모던" },
  { id: "BlackHanSans", label: "블랙한산스", file: "BlackHanSans-Regular.ttf", style: "임팩트" },
  { id: "Cafe24Ssurround", label: "카페24써라운드", file: "Cafe24Ssurround-v2.0.ttf", style: "둥근" },
  { id: "GodoB", label: "고도", file: "GodoB.ttf", style: "고딕" },
  { id: "AritaBuriKR", label: "아리따부리", file: "AritaBuriKR-SemiBold.ttf", style: "세리프" },
];

export const DEFAULT_FONT = "Pretendard";

export const SCENE_TYPES = [
  { value: "intro" as const, label: "인트로" },
  { value: "tip" as const, label: "팁/내용" },
  { value: "outro" as const, label: "아웃트로" },
];

export const DEFAULT_SCENE = {
  type: "tip" as const,
  heading: "",
  narration: "",
  visual: {
    type: "keyword-highlight" as const,
    data: { text: "", keywords: [] },
  },
};
