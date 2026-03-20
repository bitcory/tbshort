import { Composition, registerRoot } from "remotion";
import { ShortVideo } from "./compositions/ShortVideo";
import type { Script, TTSResult } from "../types/index";

// 기본 더미 데이터 (Remotion Studio 미리보기용)
const demoScript: Script = {
  topic: "Claude Code 사용법",
  title: "Claude Code로 개발 10배 빠르게 하는 법",
  scenes: [
    {
      id: "scene-1",
      type: "intro",
      heading: "Claude Code",
      narration: "터미널 하나로 개발이 완전히 달라집니다",
      durationSec: 4,
      visual: {
        type: "keyword-highlight",
        data: {
          text: "Claude Code 터미널 개발 자동화",
          keywords: ["Claude Code", "자동화"],
        },
      },
    },
    {
      id: "scene-2",
      type: "tip",
      heading: "설치 방법",
      narration: "npm install -g @anthropic-ai/claude-code 한 줄이면 끝",
      durationSec: 5,
      visual: {
        type: "code-block",
        data: {
          language: "bash",
          code: "npm install -g @anthropic-ai/claude-code\nclaude",
        },
      },
    },
    {
      id: "scene-3",
      type: "outro",
      heading: "aitoolbee",
      narration: "좋아요와 팔로우로 AI 툴 정보 놓치지 마세요",
      durationSec: 4,
      visual: {
        type: "tip-card",
        data: {
          number: 1,
          title: "팔로우하면 매일 AI 팁!",
          description: "@aitoolbee",
          emoji: "🔔",
        },
      },
    },
  ],
};

const demoTTS: TTSResult[] = [];

const FPS = 30;

function calcDuration(script: Script): number {
  const totalSec = script.scenes.reduce(
    (sum, s) => sum + (s.durationSec ?? 5),
    0
  );
  return Math.round(totalSec * FPS);
}

const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ShortVideo"
      component={ShortVideo}
      durationInFrames={calcDuration(demoScript)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{
        script: demoScript,
        ttsResults: demoTTS,
      }}
      calculateMetadata={async ({ props }) => {
        return {
          durationInFrames: calcDuration(props.script),
        };
      }}
    />
  );
};

registerRoot(RemotionRoot);
