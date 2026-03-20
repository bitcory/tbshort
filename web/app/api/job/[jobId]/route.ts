import { NextRequest } from "next/server";
import { getJob, subscribe } from "@/lib/jobStore";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = getJob(jobId);

  if (!job) {
    return new Response(JSON.stringify({ error: "Job을 찾을 수 없습니다" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // SSE 스트림
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // 현재 상태 즉시 전송
      const data = JSON.stringify(job);
      controller.enqueue(encoder.encode(`data: ${data}\n\n`));

      // 이미 완료/에러 상태면 바로 종료
      if (job.status === "completed" || job.status === "error") {
        controller.close();
        return;
      }

      // 상태 변경 리스닝
      const unsubscribe = subscribe(jobId, (updatedJob) => {
        try {
          const update = JSON.stringify(updatedJob);
          controller.enqueue(encoder.encode(`data: ${update}\n\n`));

          if (
            updatedJob.status === "completed" ||
            updatedJob.status === "error"
          ) {
            unsubscribe();
            controller.close();
          }
        } catch {
          unsubscribe();
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
