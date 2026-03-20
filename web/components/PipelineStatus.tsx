"use client";

import { CheckCircle2, XCircle, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/cn";

export type StepStatus = "idle" | "running" | "done" | "error";

export interface PipelineStep {
  label: string;
  status: StepStatus;
  detail?: string;
}

interface PipelineStatusProps {
  steps: PipelineStep[];
}

const STATUS_CONFIG: Record<
  StepStatus,
  { icon: typeof Circle; color: string; bg: string }
> = {
  idle: { icon: Circle, color: "text-foreground/30", bg: "bg-content2" },
  running: { icon: Loader2, color: "text-secondary", bg: "bg-content4" },
  done: { icon: CheckCircle2, color: "text-primary", bg: "bg-content3" },
  error: { icon: XCircle, color: "text-danger", bg: "bg-danger/10" },
};

export default function PipelineStatus({ steps }: PipelineStatusProps) {
  return (
    <div className="neo-card p-5 space-y-3">
      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
        진행 상태
      </h3>
      {steps.map((step, i) => {
        const config = STATUS_CONFIG[step.status];
        const Icon = config.icon;
        return (
          <div
            key={i}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 border-foreground/10",
              config.bg
            )}
          >
            <Icon
              className={cn("w-5 h-5 shrink-0", config.color, step.status === "running" && "animate-spin")}
              strokeWidth={2.5}
            />
            <span className={cn("text-sm font-bold", config.color)}>
              {step.label}
            </span>
            {step.detail && (
              <span className="text-xs text-subtext ml-auto font-medium">
                {step.detail}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
