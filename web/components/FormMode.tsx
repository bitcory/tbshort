"use client";

import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Sun, Moon } from "lucide-react";
import type { Script, Scene, ThemeType } from "@/lib/types";
import { DEFAULT_SCENE, SCENE_TYPES, VOICE_OPTIONS, DEFAULT_VOICE, FONT_OPTIONS, DEFAULT_FONT } from "@/lib/constants";
import { cn } from "@/lib/cn";
import SceneCard from "./SceneCard";

interface FormModeProps {
  script: Script;
  onChange: (script: Script) => void;
}

const SCENE_TYPE_COLORS: Record<string, string> = {
  intro: "bg-content4",
  tip: "bg-content3",
  outro: "bg-content2",
};

export default function FormMode({ script, onChange }: FormModeProps) {
  const [activeTab, setActiveTab] = useState(0);

  const updateScene = (index: number, scene: Scene) => {
    const scenes = [...script.scenes];
    scenes[index] = scene;
    onChange({ ...script, scenes });
  };

  const deleteScene = (index: number) => {
    const scenes = script.scenes.filter((_, i) => i !== index);
    onChange({ ...script, scenes });
    // 삭제 후 탭 보정
    if (activeTab >= scenes.length) {
      setActiveTab(Math.max(0, scenes.length - 1));
    }
  };

  const addScene = () => {
    const newId = `scene-${script.scenes.length + 1}`;
    const newScene: Scene = {
      ...DEFAULT_SCENE,
      id: newId,
      visual: { ...DEFAULT_SCENE.visual, data: { ...DEFAULT_SCENE.visual.data } },
    };
    onChange({ ...script, scenes: [...script.scenes, newScene] });
    setActiveTab(script.scenes.length); // 새 씬으로 이동
  };

  const sceneCount = script.scenes.length;

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="neo-card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-subtext mb-1 block">
              주제 (Topic)
            </span>
            <input
              type="text"
              className="memphis-input"
              placeholder="영상 주제를 입력하세요"
              value={script.topic}
              onChange={(e) => onChange({ ...script, topic: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-subtext mb-1 block">
              제목 (Title)
            </span>
            <input
              type="text"
              className="memphis-input"
              placeholder="영상 제목을 입력하세요"
              value={script.title}
              onChange={(e) => onChange({ ...script, title: e.target.value })}
            />
          </label>
        </div>

        {/* Theme & Voice Row */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Theme Selector */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-subtext mb-2 block">
              영상 테마 (Theme)
            </span>
            <div className="flex gap-2">
              {(["dark", "light"] as ThemeType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange({ ...script, theme: t })}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg border-[3px] text-sm font-bold uppercase tracking-wider transition-all",
                    (script.theme ?? "dark") === t
                      ? "border-foreground bg-content3 text-foreground"
                      : "border-transparent bg-content2/50 text-subtext hover:text-foreground hover:border-foreground/30"
                  )}
                >
                  {t === "dark" ? (
                    <Moon className="w-4 h-4" strokeWidth={2.5} />
                  ) : (
                    <Sun className="w-4 h-4" strokeWidth={2.5} />
                  )}
                  {t === "dark" ? "Dark" : "Light"}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Selector */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-subtext mb-2 block">
              TTS 음성 (Voice)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {VOICE_OPTIONS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onChange({ ...script, voice: v.id })}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border-[3px] text-xs font-bold tracking-wider transition-all",
                    (script.voice ?? DEFAULT_VOICE) === v.id
                      ? "border-foreground bg-content3 text-foreground"
                      : "border-transparent bg-content2/50 text-subtext hover:text-foreground hover:border-foreground/30"
                  )}
                >
                  <span>{v.label}</span>
                  <span className="ml-1 opacity-50">
                    {v.gender === "F" ? "♀" : "♂"}{" "}
                    {v.lang === "ko" ? "KR" : "EN"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Font Selector + Caption Clear */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-subtext">
              폰트 (Font)
            </span>
            <button
              type="button"
              onClick={() => {
                const scenes = script.scenes.map((scene) => {
                  if (scene.visual.type === "image-caption") {
                    return {
                      ...scene,
                      visual: {
                        ...scene.visual,
                        data: { ...scene.visual.data, caption: "" },
                      },
                    };
                  }
                  return scene;
                });
                onChange({ ...script, scenes });
              }}
              className="neo-btn neo-btn-ghost !border-2 !border-foreground/20 px-2.5 py-1 text-[11px] font-bold text-subtext hover:text-danger hover:!border-danger"
            >
              <X className="w-3 h-3 mr-1" />
              캡션 삭제
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {FONT_OPTIONS.map((f) => {
              const isActive = (script.font ?? DEFAULT_FONT) === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onChange({ ...script, font: f.id })}
                  className={cn(
                    "flex flex-col items-center px-4 py-2.5 rounded-lg border-[3px] transition-all min-w-[100px]",
                    isActive
                      ? "border-foreground bg-content3 text-foreground"
                      : "border-transparent bg-content2/50 text-subtext hover:text-foreground hover:border-foreground/30"
                  )}
                >
                  <span
                    className="text-base leading-tight"
                    style={{ fontFamily: `"${f.id}", sans-serif` }}
                  >
                    가나다 ABC
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-60">
                    {f.label} · {f.style}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scene Tabs */}
      {sceneCount > 0 && (
        <div className="space-y-0">
          {/* Tab Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0">
            {script.scenes.map((scene, i) => {
              const typeLabel = SCENE_TYPES.find((t) => t.value === scene.type)?.label || scene.type;
              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => setActiveTab(i)}
                  className={cn(
                    "shrink-0 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg border-[3px] border-b-0 transition-all",
                    activeTab === i
                      ? cn(
                          "border-foreground text-foreground -mb-[3px] relative z-10",
                          SCENE_TYPE_COLORS[scene.type] || "bg-content1"
                        )
                      : "border-transparent text-subtext hover:text-foreground hover:bg-content2/50"
                  )}
                >
                  {i + 1}. {typeLabel}
                </button>
              );
            })}
            {/* Add Tab */}
            <button
              type="button"
              onClick={addScene}
              className="shrink-0 px-2.5 py-2 text-subtext hover:text-primary transition-colors"
              title="씬 추가"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>

          {/* Active Scene Card */}
          <div className="card-enter" key={script.scenes[activeTab]?.id}>
            {script.scenes[activeTab] && (
              <SceneCard
                scene={script.scenes[activeTab]}
                index={activeTab}
                font={script.font}
                onChange={(s) => updateScene(activeTab, s)}
                onDelete={() => deleteScene(activeTab)}
              />
            )}
          </div>

          {/* Prev / Next Navigation */}
          {sceneCount > 1 && (
            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                disabled={activeTab === 0}
                onClick={() => setActiveTab((p) => p - 1)}
                className="neo-btn neo-btn-secondary px-3 py-1.5 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" strokeWidth={3} />
                이전
              </button>
              <span className="text-xs font-bold text-subtext">
                {activeTab + 1} / {sceneCount}
              </span>
              <button
                type="button"
                disabled={activeTab === sceneCount - 1}
                onClick={() => setActiveTab((p) => p + 1)}
                className="neo-btn neo-btn-secondary px-3 py-1.5 text-xs"
              >
                다음
                <ChevronRight className="w-3.5 h-3.5 ml-1" strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {sceneCount === 0 && (
        <button
          type="button"
          onClick={addScene}
          className="w-full py-3 border-[3px] border-dashed border-foreground/30 rounded-xl text-foreground/50 font-bold hover:border-primary hover:text-primary hover:bg-content3/50 transition-all text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          씬 추가
        </button>
      )}
    </div>
  );
}
