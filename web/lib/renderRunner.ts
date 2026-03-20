import { spawn } from "child_process";
import { writeFile, cp, mkdir, readFile, rm } from "fs/promises";
import { join, basename } from "path";
import type { Script, TTSResult } from "./types";
import { updateAndNotify } from "./jobStore";

const PROJECT_ROOT = join(process.cwd(), "..");

export async function runRender(
  script: Script,
  ttsResults: TTSResult[],
  jobId: string
): Promise<string> {
  updateAndNotify(jobId, { status: "running", progress: "렌더링 준비 중..." });

  // 오디오 파일을 public/audio/에 복사 (이전 파일 정리 후)
  const publicAudioDir = join(PROJECT_ROOT, "public", "audio");
  await rm(publicAudioDir, { recursive: true, force: true });
  await mkdir(publicAudioDir, { recursive: true });

  const propsResults = [];
  for (const tts of ttsResults) {
    const fileName = basename(tts.audioPath);
    const srcPath = tts.audioPath.startsWith("/")
      ? tts.audioPath
      : join(PROJECT_ROOT, "output", "audio", fileName);
    const destPath = join(publicAudioDir, fileName);
    try {
      await cp(srcPath, destPath);
    } catch {
      // 이미 복사된 경우 무시
    }
    propsResults.push({
      ...tts,
      audioPath: `audio/${fileName}`,
    });
  }

  // 이미지 파일도 public/images/에 복사
  const publicImagesDir = join(PROJECT_ROOT, "public", "images");
  await mkdir(publicImagesDir, { recursive: true });
  const outputImagesDir = join(PROJECT_ROOT, "output", "images");

  for (const scene of script.scenes) {
    if (
      scene.visual.type === "image-caption" &&
      scene.visual.data.imagePath
    ) {
      const imgPath = scene.visual.data.imagePath as string;
      const fileName = basename(imgPath);
      try {
        await cp(join(outputImagesDir, fileName), join(publicImagesDir, fileName));
      } catch {
        // 이미지가 없을 수 있음
      }
    }
  }

  // Remotion props 생성
  const propsPath = join(PROJECT_ROOT, "output", "remotion_props.json");
  await writeFile(
    propsPath,
    JSON.stringify({ script, ttsResults: propsResults }, null, 2),
    "utf-8"
  );

  // 파일명에서 공백/특수문자를 안전하게 변환
  const safeTopic = (script.topic || "video").replace(/[\/\\?%*:|"<>\s]+/g, "_");
  const outputVideoPath = join(PROJECT_ROOT, "output", `${safeTopic}.mp4`);

  updateAndNotify(jobId, { progress: "Remotion 렌더링 시작..." });

  return new Promise((resolve, reject) => {
    const proc = spawn(
      "npx",
      [
        "remotion",
        "render",
        "src/remotion/index.tsx",
        "ShortVideo",
        outputVideoPath,
        `--props=${propsPath}`,
      ],
      {
        cwd: PROJECT_ROOT,
        stdio: ["ignore", "pipe", "pipe"],
      }
    );

    let stderrBuf = "";

    proc.stdout.on("data", (data: Buffer) => {
      const text = data.toString().trim();
      if (text) {
        // Remotion 진행률 파싱 (예: "Rendering frame 30/120")
        const match = text.match(/(\d+)%|frame\s+(\d+)\/(\d+)/i);
        if (match) {
          const progress = match[1]
            ? `렌더링 ${match[1]}%`
            : `렌더링 프레임 ${match[2]}/${match[3]}`;
          updateAndNotify(jobId, { progress });
        } else {
          updateAndNotify(jobId, { progress: text.slice(0, 100) });
        }
      }
    });

    proc.stderr.on("data", (data: Buffer) => {
      const text = data.toString().trim();
      stderrBuf += text + "\n";
      // Remotion은 stderr에도 진행 정보를 출력
      const match = text.match(/(\d+)%|frame\s+(\d+)\/(\d+)/i);
      if (match) {
        const progress = match[1]
          ? `렌더링 ${match[1]}%`
          : `렌더링 프레임 ${match[2]}/${match[3]}`;
        updateAndNotify(jobId, { progress });
      }
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`렌더링 실패 (code ${code}): ${stderrBuf.slice(-500)}`));
        return;
      }
      const filename = basename(outputVideoPath);
      resolve(filename);
    });
  });
}
