import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Script } from "../types/index.js";

export type ScriptStyle = "default" | "psychology";

const SYSTEM_PROMPT = `당신은 aitoolbee 채널의 AI 툴 소개 숏폼 영상 대본 작성 전문가입니다.

## 출력 규칙
- 반드시 순수 JSON만 출력 (마크다운 코드블록 없이)
- 다른 텍스트 일절 금지

## 대본 구조
- intro: 1개 (주제 훅, 3초 이내 나레이션)
- tip: 3~5개 (핵심 팁, 씬당 나레이션 50자 이내)
- outro: 1개 (CTA, "좋아요 + 팔로우" 유도)

## Visual 타입 선택 기준
- step-flow: 순서가 있는 프로세스 설명
- code-block: 명령어/코드 예시
- comparison: A vs B 비교
- numbered-list: 목록형 팁
- bar-chart: 수치 비교
- keyword-highlight: 핵심 단어 강조
- checklist: 체크리스트
- quote-card: 인용/명언
- tip-card: 단일 팁 강조
- stats-card: 통계/숫자

## JSON 스키마
{
  "topic": "string",
  "title": "string (유튜브 쇼츠 제목)",
  "scenes": [
    {
      "id": "scene-1",
      "type": "intro|tip|outro",
      "heading": "string (화면 상단, 10자 이내)",
      "narration": "string (TTS 읽을 텍스트, 50자 이내)",
      "visual": {
        "type": "VisualType",
        "data": { /* 타입에 맞는 데이터 */ }
      }
    }
  ]
}`;

const PSYCHOLOGY_SYSTEM_PROMPT = `당신은 심리학 전문 숏폼 영상 대본 작성 전문가입니다.

## 출력 규칙
- 반드시 순수 JSON만 출력 (마크다운 코드블록 없이)
- 다른 텍스트 일절 금지

## 대본 구조
- intro: 1개 (후킹 인트로 - 질문형 또는 충격 사실형, 3~5초)
  - 예: "혹시 이런 말 자주 듣고 있지 않나요?", "심리학에서 밝혀진 충격적인 사실"
- tip: 3~5개 (핵심 포인트, 씬당 나레이션 50자 이내)
- outro: 1개 (CTA, "구독 + 좋아요" 유도, 공감형 마무리)

## Visual 타입 - image-caption 주력 사용
모든 tip 씬에서 "image-caption" 타입을 사용하세요.
intro와 outro는 "keyword-highlight", "quote-card", "tip-card" 등 텍스트 기반 타입을 사용할 수 있습니다.

### image-caption 데이터 형식
{
  "type": "image-caption",
  "data": {
    "imagePrompt": "영어로 작성된 AI 이미지 생성 프롬프트 (구체적이고 시각적인 장면 묘사)",
    "caption": "한국어 캡션 (핵심 메시지, 20자 이내)"
  }
}

### imagePrompt 작성 가이드
- 반드시 영어로 작성
- 심리학적 상황을 시각적으로 묘사 (감정, 표정, 제스처, 환경)
- 실사 느낌의 시네마틱한 장면 (cinematic lighting, dramatic, emotional)
- 인물이 등장하는 경우 characterDescription의 외모를 일관되게 반영
- 예시: "A young woman sitting alone in a dimly lit cafe, looking at her phone with a worried expression, cinematic lighting, emotional portrait, 9:16 vertical composition"

## characterDescription
모든 씬에서 동일 인물이 등장할 경우, characterDescription 필드에 인물 외모를 구체적으로 기술하세요.
예: "Korean woman in her late 20s, shoulder-length black hair, wearing a cream-colored knit sweater"

## JSON 스키마
{
  "topic": "string",
  "title": "string (유튜브 쇼츠 제목, 호기심 유발형)",
  "characterDescription": "string (등장 인물 외모 설명, 영어)",
  "scenes": [
    {
      "id": "scene-1",
      "type": "intro|tip|outro",
      "heading": "string (화면 상단, 10자 이내)",
      "narration": "string (TTS 읽을 텍스트, 50자 이내)",
      "visual": {
        "type": "image-caption",
        "data": {
          "imagePrompt": "English prompt for AI image generation",
          "caption": "한국어 캡션"
        }
      }
    }
  ]
}`;

function getModel(style: ScriptStyle) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const systemPrompt = style === "psychology" ? PSYCHOLOGY_SYSTEM_PROMPT : SYSTEM_PROMPT;
  return genAI.getGenerativeModel({
    model: "gemini-3-pro-preview",
    systemInstruction: systemPrompt,
  });
}

export async function generateScript(topic: string, style: ScriptStyle = "default"): Promise<Script> {
  console.log(`\n🎬 대본 생성 중: "${topic}" (스타일: ${style})`);

  const model = getModel(style);

  const userPrompt = style === "psychology"
    ? `주제: "${topic}"

위 주제로 심리학 숏폼 영상 대본을 JSON으로 생성해주세요.
- 후킹 인트로로 시청자의 관심을 끌어주세요
- tip 씬은 모두 image-caption 타입을 사용해주세요
- imagePrompt는 영어로 구체적인 장면을 묘사해주세요
- caption은 한국어로 핵심 메시지를 작성해주세요
- characterDescription으로 인물 외모 일관성을 유지해주세요
총 영상 길이는 45~60초 목표입니다.`
    : `주제: "${topic}"

위 주제로 aitoolbee 채널 숏폼 영상 대본을 JSON으로 생성해주세요.
총 영상 길이는 45~60초 목표입니다.`;

  const result = await model.generateContent(userPrompt);

  const text = result.response.text();
  const raw = text.replace(/```json|```/g, "").trim();

  try {
    const script = JSON.parse(raw) as Script;
    console.log(
      `✅ 대본 생성 완료: ${script.scenes.length}개 씬 (${script.title})`
    );
    return script;
  } catch {
    throw new Error(`JSON 파싱 실패:\n${raw}`);
  }
}

export async function generateScriptFromJSON(path: string): Promise<Script> {
  const { readFile } = await import("fs/promises");
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as Script;
}
