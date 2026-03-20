"use client";

import { useState, useCallback } from "react";
import {
  Clapperboard,
  Loader2,
  Sparkles,
  Film,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import type { Script, TTSResult } from "@/lib/types";
import ScriptEditor from "@/components/ScriptEditor";
import PipelineStatus, { type PipelineStep } from "@/components/PipelineStatus";
import VideoPlayer from "@/components/VideoPlayer";

const INITIAL_SCRIPT: Script = {
  topic: "",
  title: "",
  theme: "dark",
  voice: "ko-KR-SunHiNeural",
  font: "Pretendard",
  scenes: [],
};

interface JobEvent {
  status: string;
  progress?: string;
  result?: Record<string, unknown>;
  error?: string;
}

function watchJob(jobId: string, onUpdate: (data: JobEvent) => void): () => void {
  const es = new EventSource(`/api/job/${jobId}`);
  es.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data) as JobEvent;
      onUpdate(data);
      if (data.status === "completed" || data.status === "error") {
        es.close();
      }
    } catch {
      // ignore
    }
  };
  es.onerror = () => {
    es.close();
  };
  return () => es.close();
}

export default function Home() {
  const [script, setScript] = useState<Script>(INITIAL_SCRIPT);
  const [generating, setGenerating] = useState(false);
  const [videoFilename, setVideoFilename] = useState<string | null>(null);
  const [steps, setSteps] = useState<PipelineStep[]>([
    { label: "스크립트 저장", status: "idle" },
    { label: "TTS 생성", status: "idle" },
    { label: "영상 렌더링", status: "idle" },
  ]);

  const updateStep = useCallback(
    (index: number, update: Partial<PipelineStep>) => {
      setSteps((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...update };
        return next;
      });
    },
    []
  );

  const resetSteps = useCallback(() => {
    setSteps([
      { label: "스크립트 저장", status: "idle" },
      { label: "TTS 생성", status: "idle" },
      { label: "영상 렌더링", status: "idle" },
    ]);
    setVideoFilename(null);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!script.topic || !script.scenes.length) {
      alert("주제와 최소 1개의 씬이 필요합니다.");
      return;
    }

    setGenerating(true);
    resetSteps();

    try {
      updateStep(0, { status: "done" });
      updateStep(1, { status: "running", detail: "시작 중..." });

      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });

      if (!ttsRes.ok) {
        const err = await ttsRes.json();
        throw new Error(err.error || "TTS 요청 실패");
      }

      const { jobId: ttsJobId } = await ttsRes.json();

      const ttsResult = await new Promise<{
        ttsResults: TTSResult[];
        script: Script;
      }>((resolve, reject) => {
        watchJob(ttsJobId, (data) => {
          if (data.status === "running") {
            updateStep(1, { detail: data.progress });
          } else if (data.status === "completed") {
            updateStep(1, { status: "done", detail: "완료" });
            resolve(data.result as { ttsResults: TTSResult[]; script: Script });
          } else if (data.status === "error") {
            updateStep(1, { status: "error", detail: data.error });
            reject(new Error(data.error || "TTS 실패"));
          }
        });
      });

      setScript(ttsResult.script);

      updateStep(2, { status: "running", detail: "시작 중..." });

      const renderRes = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: ttsResult.script,
          ttsResults: ttsResult.ttsResults,
        }),
      });

      if (!renderRes.ok) {
        const err = await renderRes.json();
        throw new Error(err.error || "렌더링 요청 실패");
      }

      const { jobId: renderJobId } = await renderRes.json();

      await new Promise<void>((resolve, reject) => {
        watchJob(renderJobId, (data) => {
          if (data.status === "running") {
            updateStep(2, { detail: data.progress });
          } else if (data.status === "completed") {
            updateStep(2, { status: "done", detail: "완료" });
            const result = data.result as { filename: string };
            setVideoFilename(result.filename);
            resolve();
          } else if (data.status === "error") {
            updateStep(2, { status: "error", detail: data.error });
            reject(new Error(data.error || "렌더링 실패"));
          }
        });
      });
    } catch (err) {
      console.error("파이프라인 오류:", err);
    } finally {
      setGenerating(false);
    }
  }, [script, updateStep, resetSteps]);

  const hasActivity = steps.some((s) => s.status !== "idle");

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="w-full sticky top-0 z-50 bg-background border-b-[3px] border-foreground">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <Clapperboard className="w-6 h-6 text-primary" strokeWidth={2.5} />
              <h1 className="text-xl font-black tracking-tight uppercase">
                <span className="text-primary">AITOOLBEE</span>
                <span className="text-foreground">-SHORTS</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="memphis-badge bg-content3 text-foreground">
                <Sparkles className="w-3 h-3 mr-1" />
                영상 생성기
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Script Editor */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-foreground" strokeWidth={2.5} />
                <h2 className="text-lg font-black uppercase tracking-wider">
                  대본 편집
                </h2>
              </div>
              <a
                href="https://gemini.google.com/gem/14NuYTkP1t8_Omz_68ImexcqyVBLuk_Sp?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="neo-btn neo-btn-primary px-4 py-2 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                시작하기
                <ExternalLink className="w-3 h-3 ml-1.5" />
              </a>
            </div>
            <ScriptEditor script={script} onChange={setScript} />
          </div>

          {/* Right: Sidebar */}
          <div className="w-full lg:w-[380px] shrink-0 space-y-4">
            {/* Pipeline Flow */}
            <div className="neo-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <ArrowRight className="w-4 h-4 text-primary" strokeWidth={3} />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  파이프라인
                </h3>
              </div>

              <div className="flex items-center gap-2 mb-4 text-xs font-bold text-subtext">
                <span className="memphis-badge bg-content2 text-foreground">대본</span>
                <ArrowRight className="w-3 h-3" />
                <span className="memphis-badge bg-content4 text-foreground">TTS</span>
                <ArrowRight className="w-3 h-3" />
                <span className="memphis-badge bg-content3 text-foreground">렌더링</span>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className={`neo-btn w-full py-3 text-sm ${
                  generating ? "neo-btn-secondary" : "neo-btn-primary"
                }`}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    영상 생성
                  </>
                )}
              </button>
            </div>

            {/* Pipeline Status */}
            {hasActivity && <PipelineStatus steps={steps} />}

            {/* Video Player */}
            {videoFilename && <VideoPlayer filename={videoFilename} />}
          </div>
        </div>
      </div>
    </div>
  );
}
