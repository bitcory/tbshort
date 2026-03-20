import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import type { Script, TTSResult } from "../../types/index";
import {
  StepFlow,
  CodeBlock,
  Comparison,
  NumberedList,
  TipCard,
  ChecklistVisual,
  QuoteCard,
  KeywordHighlight,
  StatsCard,
} from "../components/visuals/index";
import { ImageCaption } from "../components/visuals/ImageCaption";
import { LAYOUT } from "../constants";
import { ThemeProvider, useThemeColors, useFontFamily } from "../ThemeContext";

// ============================================
// Visual 컴포넌트 라우터
// ============================================
function VisualRouter({
  visual,
}: {
  visual: { type: string; data: Record<string, unknown> };
}) {
  switch (visual.type) {
    case "step-flow":
      return <StepFlow data={visual.data as any} />;
    case "code-block":
      return <CodeBlock data={visual.data as any} />;
    case "comparison":
      return <Comparison data={visual.data as any} />;
    case "numbered-list":
      return <NumberedList data={visual.data as any} />;
    case "tip-card":
      return <TipCard data={visual.data as any} />;
    case "checklist":
      return <ChecklistVisual data={visual.data as any} />;
    case "quote-card":
      return <QuoteCard data={visual.data as any} />;
    case "keyword-highlight":
      return <KeywordHighlight data={visual.data as any} />;
    case "stats-card":
      return <StatsCard data={visual.data as any} />;
    case "image-caption":
      return <ImageCaption data={visual.data as any} />;
    default:
      return null;
  }
}

// ============================================
// 자막 컴포넌트
// ============================================
// 문장 끝 판별 (마침표, 물음표, 느낌표 등)
const SENTENCE_END = /[.!?。！？]$/;

// 타임스탬프를 문장 단위 청크로 나누기
function chunkTimestamps(
  timestamps: { text: string; startMs: number; endMs: number }[]
) {
  const chunks: { text: string; startMs: number; endMs: number }[][] = [];
  let current: { text: string; startMs: number; endMs: number }[] = [];

  for (const t of timestamps) {
    current.push(t);
    if (SENTENCE_END.test(t.text.trim())) {
      chunks.push(current);
      current = [];
    }
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

function Subtitle({
  timestamps,
  frame,
  fps,
}: {
  timestamps: { text: string; startMs: number; endMs: number }[];
  frame: number;
  fps: number;
}) {
  const colors = useThemeColors();
  const fontFamily = useFontFamily();
  const currentMs = (frame / fps) * 1000;

  // 청크 단위로 나누어 표시
  const chunks = chunkTimestamps(timestamps);

  // 현재 시간에 해당하는 청크 찾기
  const activeChunk = chunks.find((chunk) => {
    const start = chunk[0].startMs;
    const end = chunk[chunk.length - 1].endMs;
    return currentMs >= start - 100 && currentMs <= end + 300;
  });

  if (!activeChunk) return null;

  // 현재 읽고 있는 단어 판별
  const activeWords = timestamps.filter(
    (t) => t.startMs <= currentMs && t.endMs >= currentMs - 150
  );
  const activeTexts = activeWords.map((w) => w.text);

  // 청크 페이드인 애니메이션
  const chunkStartMs = activeChunk[0].startMs;
  const fadeProgress = Math.min(1, (currentMs - chunkStartMs + 100) / 200);

  return (
    <AbsoluteFill
      style={{
        top: LAYOUT.SUBTITLE_TOP,
        height: LAYOUT.SUBTITLE_HEIGHT,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "40px 60px",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontSize: 46,
          fontFamily,
          fontWeight: 700,
          lineHeight: 1.7,
          color: colors.text,
          textShadow: "none",
          opacity: fadeProgress,
          transform: `translateY(${(1 - fadeProgress) * 12}px)`,
          wordBreak: "keep-all",
          overflowWrap: "break-word",
        }}
      >
        {(() => {
          // 문장 단위 줄바꿈 (청크 내 문장 경계에서 줄 분리)
          const lines: typeof activeChunk[] = [];
          let line: typeof activeChunk = [];
          for (const w of activeChunk) {
            line.push(w);
            if (SENTENCE_END.test(w.text.trim())) {
              lines.push(line);
              line = [];
            }
          }
          if (line.length > 0) lines.push(line);

          return lines.map((words, li) => (
            <div key={li} style={{ textAlign: "center" }}>
              {words.map((w, i) => {
                const isActive = activeTexts.includes(w.text);
                return (
                  <span
                    key={`${w.startMs}-${i}`}
                    style={{
                      color: colors.text,
                      fontWeight: isActive ? 900 : 700,
                    }}
                  >
                    {w.text}{" "}
                  </span>
                );
              })}
            </div>
          ));
        })()}
      </div>
    </AbsoluteFill>
  );
}

// ============================================
// 씬 컴포넌트
// ============================================
function SceneComponent({
  scene,
  ttsResult,
}: {
  scene: any;
  ttsResult: TTSResult | undefined;
}) {
  const colors = useThemeColors();
  const fontFamily = useFontFamily();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = spring({ frame, fps, config: { damping: 20 } });
  const slideY = interpolate(fadeIn, [0, 1], [30, 0]);

  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      {/* 상단: 헤딩 영역 */}
      <AbsoluteFill
        style={{
          top: LAYOUT.HEADING_TOP,
          height: LAYOUT.HEADING_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: fadeIn,
          transform: `translateY(${slideY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontFamily,
            fontWeight: 900,
            color: colors.text,
            letterSpacing: "-1px",
            textAlign: "center",
            padding: "0 60px",
          }}
        >
          {scene.heading}
        </div>
      </AbsoluteFill>

      {/* 중앙: Visual 영역 */}
      <AbsoluteFill
        style={{
          top: LAYOUT.VISUAL_TOP,
          height: LAYOUT.VISUAL_HEIGHT,
          opacity: fadeIn,
        }}
      >
        <VisualRouter visual={scene.visual} />
      </AbsoluteFill>

      {/* 하단: 자막 영역 */}
      {ttsResult && (
        <Subtitle
          timestamps={ttsResult.timestamps}
          frame={frame}
          fps={fps}
        />
      )}

      {/* aitoolbee 워터마크 (세이프 영역 상단) */}
      <div
        style={{
          position: "absolute",
          top: LAYOUT.WATERMARK_TOP,
          right: 50,
          fontSize: 28,
          color: colors.subtext,
          fontFamily,
          fontWeight: 700,
          opacity: 0.6,
        }}
      >
        @aitoolbee
      </div>
    </AbsoluteFill>
  );
}

// ============================================
// 메인 컴포지션
// ============================================
export function ShortVideo({
  script,
  ttsResults,
}: {
  script: Script;
  ttsResults: TTSResult[];
}) {
  const { fps } = useVideoConfig();

  let cumulativeFrame = 0;

  return (
    <ThemeProvider theme={script.theme} font={script.font}>
      <AbsoluteFill>
        {script.scenes.map((scene) => {
          const durationSec = scene.durationSec ?? 5;
          const durationFrames = Math.round(durationSec * fps);
          const from = cumulativeFrame;
          cumulativeFrame += durationFrames;

          const ttsResult = ttsResults.find((t) => t.sceneId === scene.id);

          return (
            <Sequence key={scene.id} from={from} durationInFrames={durationFrames}>
              <SceneComponent scene={scene} ttsResult={ttsResult} />
              {ttsResult?.audioPath && (
                <Audio src={staticFile(ttsResult.audioPath)} />
              )}
            </Sequence>
          );
        })}
      </AbsoluteFill>
    </ThemeProvider>
  );
}
