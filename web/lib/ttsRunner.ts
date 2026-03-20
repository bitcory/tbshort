import { spawn } from "child_process";
import { existsSync } from "fs";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { Script, TTSResult } from "./types";
import { updateAndNotify } from "./jobStore";

// 프로젝트 루트 (web/ 의 부모)
const PROJECT_ROOT = join(process.cwd(), "..");

export async function runTTS(
  script: Script,
  jobId: string
): Promise<TTSResult[]> {
  const outputDir = join(PROJECT_ROOT, "output");
  const audioDir = join(outputDir, "audio");

  await mkdir(audioDir, { recursive: true });

  // 임시 대본 저장
  const scriptPath = join(outputDir, "script_temp.json");
  await writeFile(scriptPath, JSON.stringify(script, null, 2), "utf-8");

  // 대본도 저장
  const mainScriptPath = join(outputDir, "script.json");
  await writeFile(mainScriptPath, JSON.stringify(script, null, 2), "utf-8");

  updateAndNotify(jobId, { status: "running", progress: "TTS 합성 시작..." });

  const pythonScript = join(PROJECT_ROOT, "src", "tts", "synthesize.py");
  const venvPython = join(PROJECT_ROOT, ".venv", "bin", "python3");
  const pythonBin = existsSync(venvPython) ? venvPython : "python3";

  return new Promise((resolve, reject) => {
    const proc = spawn(pythonBin, [pythonScript, scriptPath, audioDir], {
      cwd: PROJECT_ROOT,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderrBuf = "";

    proc.stdout.on("data", (data: Buffer) => {
      const text = data.toString().trim();
      if (text) {
        // synthesize.py의 진행 로그를 파싱
        updateAndNotify(jobId, { progress: text });
      }
    });

    proc.stderr.on("data", (data: Buffer) => {
      stderrBuf += data.toString();
    });

    proc.on("close", async (code) => {
      if (code !== 0) {
        reject(new Error(`TTS 실패 (code ${code}): ${stderrBuf}`));
        return;
      }

      try {
        const resultsPath = join(audioDir, "tts_results.json");
        const results = JSON.parse(
          await readFile(resultsPath, "utf-8")
        ) as TTSResult[];

        // 씬 duration 업데이트
        for (const scene of script.scenes) {
          const tts = results.find((r) => r.sceneId === scene.id);
          if (tts) {
            scene.durationSec = Math.ceil(tts.durationMs / 1000) + 1;
          }
        }

        // 업데이트된 대본 다시 저장
        await writeFile(
          mainScriptPath,
          JSON.stringify(script, null, 2),
          "utf-8"
        );

        resolve(results);
      } catch (err) {
        reject(err);
      }
    });
  });
}
