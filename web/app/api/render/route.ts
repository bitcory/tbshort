import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import type { Script, TTSResult } from "@/lib/types";
import {
  createJob,
  updateAndNotify,
  releaseLock,
} from "@/lib/jobStore";
import { runRender } from "@/lib/renderRunner";

export async function POST(request: NextRequest) {
  try {
    const { script, ttsResults } = (await request.json()) as {
      script: Script;
      ttsResults: TTSResult[];
    };

    if (!script || !ttsResults?.length) {
      return NextResponse.json(
        { error: "스크립트와 TTS 결과가 필요합니다" },
        { status: 400 }
      );
    }

    const jobId = uuidv4();
    createJob(jobId, "render");

    // 비동기로 렌더링 실행
    runRender(script, ttsResults, jobId)
      .then((filename) => {
        updateAndNotify(jobId, {
          status: "completed",
          progress: "렌더링 완료",
          result: { filename },
        });
        releaseLock();
      })
      .catch((err) => {
        updateAndNotify(jobId, {
          status: "error",
          error: err instanceof Error ? err.message : "렌더링 실패",
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
