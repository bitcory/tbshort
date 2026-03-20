"use client";

import { useState } from "react";
import { FileText, Code2 } from "lucide-react";
import type { Script } from "@/lib/types";
import { cn } from "@/lib/cn";
import FormMode from "./FormMode";
import JsonMode from "./JsonMode";

interface ScriptEditorProps {
  script: Script;
  onChange: (script: Script) => void;
}

export default function ScriptEditor({ script, onChange }: ScriptEditorProps) {
  const [mode, setMode] = useState<"form" | "json">("form");

  return (
    <div className="space-y-4">
      {/* Mode Toggle - Neobrutalist tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          className={cn(
            "neo-btn px-5 py-2 text-sm",
            mode === "form"
              ? "neo-btn-primary"
              : "neo-btn-secondary"
          )}
          onClick={() => setMode("form")}
        >
          <FileText className="w-4 h-4 mr-2" strokeWidth={2.5} />
          폼 모드
        </button>
        <button
          type="button"
          className={cn(
            "neo-btn px-5 py-2 text-sm",
            mode === "json"
              ? "neo-btn-primary"
              : "neo-btn-secondary"
          )}
          onClick={() => setMode("json")}
        >
          <Code2 className="w-4 h-4 mr-2" strokeWidth={2.5} />
          JSON 모드
        </button>
      </div>

      {/* Editor */}
      {mode === "form" ? (
        <FormMode script={script} onChange={onChange} />
      ) : (
        <JsonMode script={script} onChange={onChange} onApply={() => setMode("form")} />
      )}
    </div>
  );
}
