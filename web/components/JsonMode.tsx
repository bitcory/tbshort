"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import type { Script } from "@/lib/types";

interface JsonModeProps {
  script: Script;
  onChange: (script: Script) => void;
  onApply?: () => void;
}

export default function JsonMode({ script, onChange, onApply }: JsonModeProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // 최초 진입 시에는 빈칸, 이후 외부에서 script가 바뀌면 동기화
    if (!initialized) {
      setInitialized(true);
      return;
    }
    setText(JSON.stringify(script, null, 2));
    setError(null);
  }, [script, initialized]);

  const handleChange = useCallback(
    (value: string) => {
      setText(value);
      try {
        const parsed = JSON.parse(value) as Script;
        if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
          setError("scenes 배열이 필요합니다");
          return;
        }
        setError(null);
        onChange(parsed);
      } catch (e) {
        setError(e instanceof Error ? e.message : "JSON 파싱 오류");
      }
    },
    [onChange]
  );

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex justify-end">
          <span className="memphis-badge bg-danger text-danger-foreground text-[10px]">
            <AlertCircle className="w-3 h-3 mr-1" />
            {error}
          </span>
        </div>
      )}
      <textarea
        className="json-editor memphis-textarea min-h-[600px] leading-relaxed"
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onPaste={(e) => {
          // 붙여넣기 시 유효한 JSON이면 자동으로 폼 모드 전환
          const pasted = e.clipboardData.getData("text");
          try {
            const parsed = JSON.parse(pasted) as Script;
            if (parsed.scenes && Array.isArray(parsed.scenes)) {
              e.preventDefault();
              setText(JSON.stringify(parsed, null, 2));
              setError(null);
              onChange(parsed);
              setTimeout(() => onApply?.(), 100);
            }
          } catch {
            // 일반 텍스트면 기본 동작
          }
        }}
        spellCheck={false}
      />
    </div>
  );
}
