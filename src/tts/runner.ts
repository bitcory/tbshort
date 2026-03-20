import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { Script, TTSResult } from "../types/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function runTTS(
  script: Script,
  outputDir: string
): Promise<TTSResult[]> {
  console.log("\n🎙️ TTS 합성 시작...");

  // 임시 대본 JSON 저장
  const scriptPath = join(outputDir, "script_temp.json");
  writeFileSync(scriptPath, JSON.stringify(script, null, 2), "utf-8");

  const pythonScript = join(__dirname, "synthesize.py");
  const audioDir = join(outputDir, "audio");

  try {
    // venv가 있으면 venv의 python 사용, 없으면 시스템 python3
    const venvPython = join(__dirname, "../../.venv/bin/python3");
    const { existsSync } = await import("fs");
    const pythonBin = existsSync(venvPython) ? venvPython : "python3";

    execSync(`"${pythonBin}" "${pythonScript}" "${scriptPath}" "${audioDir}"`, {
      stdio: "inherit",
    });
  } catch (err) {
    throw new Error(
      `TTS 실패: edge-tts가 설치되어 있나요? pip install edge-tts`
    );
  }

  // 결과 읽기
  const resultsPath = join(audioDir, "tts_results.json");
  const results = JSON.parse(
    readFileSync(resultsPath, "utf-8")
  ) as TTSResult[];

  // 씬 duration 업데이트
  for (const scene of script.scenes) {
    const tts = results.find((r) => r.sceneId === scene.id);
    if (tts) {
      scene.durationSec = Math.ceil(tts.durationMs / 1000) + 1; // 1초 여유
    }
  }

  return results;
}
