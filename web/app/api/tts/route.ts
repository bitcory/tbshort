import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import type { Script } from "@/lib/types";
import {
  createJob,
  updateAndNotify,
  acquireLock,
  releaseLock,
  isPipelineLocked,
} from "@/lib/jobStore";
import { runTTS } from "@/lib/ttsRunner";

export async function POST(request: NextRequest) {
  try {
    if (isPipelineLocked()) {
      return NextResponse.json(
        { error: "이미 작업이 진행 중입니다. 완료 후 다시 시도해주세요." },
        { status: 409 }
      );
    }

    const { script } = (await request.json()) as { script: Script };

    if (!script || !script.scenes?.length) {
      return NextResponse.json(
        { error: "유효한 스크립트가 필요합니다" },
        { status: 400 }
      );
    }

    if (!acquireLock()) {
      return NextResponse.json(
        { error: "락 획득 실패" },
        { status: 409 }
      );
    }

    const jobId = uuidv4();
    createJob(jobId, "tts");

    // 비동기로 TTS 실행
    runTTS(script, jobId)
      .then((results) => {
        updateAndNotify(jobId, {
          status: "completed",
          progress: "TTS 완료",
          result: { ttsResults: results, script },
        });
      })
      .catch((err) => {
        updateAndNotify(jobId, {
          status: "error",
          error: err instanceof Error ? err.message : "TTS 실패",
        });
        releaseLock();
      });

    return NextResponse.json({ jobId });
  } catch (err) {
    releaseLock();
    const message = err instanceof Error ? err.message : "요청 처리 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
