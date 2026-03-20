#!/usr/bin/env node
/**
 * aitoolbee-shorts CLI
 * 
 * 사용법:
 *   npx tsx src/cli/index.ts --topic "개발자 아침 루틴"
 *   npx tsx src/cli/index.ts --json ./my-script.json
 *   npx tsx src/cli/index.ts --topic "AI 툴 추천" --no-tts  (대본만 생성)
 */

import { Command } from "commander";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { generateScript, generateScriptFromJSON, type ScriptStyle } from "../script/generator.js";
import { runTTS } from "../tts/runner.js";
import { generateImages } from "../image/generator.js";

const program = new Command();

program
  .name("aitoolbee-shorts")
  .description("AI 숏폼 영상 자동 생성 파이프라인")
  .version("1.0.0");

program
  .option("-t, --topic <topic>", "영상 주제 (Claude가 대본 자동 생성)")
  .option("-j, --json <path>", "직접 작성한 대본 JSON 파일 경로")
  .option("-o, --output <dir>", "출력 디렉토리", "./output")
  .option("-s, --style <style>", "대본 스타일 (default | psychology)", "default")
  .option("--no-tts", "TTS 건너뛰기 (대본 JSON만 생성)")
  .option("--no-render", "렌더링 건너뛰기 (대본 + TTS만 실행)")
  .parse();

const opts = program.opts();

async function run() {
  console.log(`
╔══════════════════════════════════════╗
║   aitoolbee-shorts 파이프라인 v1.0   ║
╚══════════════════════════════════════╝
  `);

  // 출력 디렉토리 생성
  const outputDir = opts.output as string;
  await mkdir(outputDir, { recursive: true });

  // ── STEP 1: 대본 생성 ──────────────────────────
  let script;

  if (opts.json) {
    console.log(`📄 JSON 대본 로드: ${opts.json}`);
    script = await generateScriptFromJSON(opts.json);
  } else if (opts.topic) {
    script = await generateScript(opts.topic, opts.style as ScriptStyle);
  } else {
    console.error("❌ --topic 또는 --json 옵션이 필요합니다");
    process.exit(1);
  }

  // 대본 저장
  const scriptPath = join(outputDir, "script.json");
  await writeFile(scriptPath, JSON.stringify(script, null, 2), "utf-8");
  console.log(`\n📄 대본 저장: ${scriptPath}`);
  console.log(`   씬 구성: ${script.scenes.map((s: any) => s.type).join(" → ")}`);

  // ── STEP 1.5: 이미지 생성 (image-caption 씬이 있을 때) ──
  const hasImageScenes = script.scenes.some(
    (s: any) => s.visual.type === "image-caption"
  );
  if (hasImageScenes) {
    script = await generateImages(script, outputDir);
    // 이미지 경로가 반영된 대본 다시 저장
    await writeFile(scriptPath, JSON.stringify(script, null, 2), "utf-8");
  }

  // ── STEP 2: TTS 합성 ──────────────────────────
  let ttsResults = [];

  if (opts.tts !== false) {
    try {
      ttsResults = await runTTS(script, outputDir);
    } catch (err) {
      console.warn(`\n⚠️ TTS 실패 (영상 렌더링은 자막 없이 진행됩니다)`);
      console.warn(`   edge-tts 설치: pip install edge-tts`);
    }
  }

  // ── STEP 3: Remotion 렌더링 ────────────────────
  if (opts.render !== false && ttsResults.length > 0) {
    await renderVideo(script, ttsResults, outputDir);
  }

  // ── 완료 ──────────────────────────────────────
  const totalSec = script.scenes.reduce(
    (sum: number, s: any) => sum + (s.durationSec ?? 5),
    0
  );

  console.log(`
╔══════════════════════════════════════╗
║            ✅ 생성 완료              ║
╠══════════════════════════════════════╣
║  제목: ${script.title?.slice(0, 28)}
║  씬 수: ${script.scenes.length}개
║  예상 길이: ${totalSec}초
║  출력 위치: ${outputDir}
╚══════════════════════════════════════╝
  `);
}

async function renderVideo(script: any, ttsResults: any[], outputDir: string) {
  console.log("\n🎬 영상 렌더링 시작...");

  const { writeFile, cp, mkdir: mkdirFs } = await import("fs/promises");
  const { resolve, basename } = await import("path");

  // 오디오 파일을 public/audio/에 복사 (Remotion staticFile 접근용)
  const publicAudioDir = join("public", "audio");
  await mkdirFs(publicAudioDir, { recursive: true });

  const propsResults = [];
  for (const tts of ttsResults) {
    const fileName = basename(tts.audioPath);
    const destPath = join(publicAudioDir, fileName);
    await cp(tts.audioPath, destPath);
    propsResults.push({
      ...tts,
      audioPath: `audio/${fileName}`,
    });
  }

  // Remotion props 파일 생성
  const propsPath = join(outputDir, "remotion_props.json");
  await writeFile(
    propsPath,
    JSON.stringify({ script, ttsResults: propsResults }, null, 2),
    "utf-8"
  );

  const outputVideoPath = join(outputDir, `${script.topic || "video"}.mp4`);

  const { execSync } = await import("child_process");

  try {
    execSync(
      `npx remotion render src/remotion/index.tsx ShortVideo "${outputVideoPath}" \
      --props="${propsPath}"`,
      { stdio: "inherit" }
    );
    console.log(`\n🎬 영상 저장: ${outputVideoPath}`);
  } catch {
    console.error("\n❌ Remotion 렌더링 실패");
    console.log("   Remotion 설치 확인: npm install remotion @remotion/cli @remotion/renderer");
  }
}

run().catch((err) => {
  console.error("\n❌ 파이프라인 오류:", err.message);
  process.exit(1);
});
