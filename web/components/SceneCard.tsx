"use client";

import { Trash2, GripVertical } from "lucide-react";
import type { Scene, VisualType, SceneType } from "@/lib/types";
import { VISUAL_META, SCENE_TYPES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import VisualDataForm from "./VisualDataForm";

interface SceneCardProps {
  scene: Scene;
  index: number;
  font?: string;
  onChange: (scene: Scene) => void;
  onDelete: () => void;
}

const VISUAL_TYPES = Object.entries(VISUAL_META).map(([value, meta]) => ({
  value: value as VisualType,
  label: meta.label,
}));

const SCENE_TYPE_COLORS: Record<string, string> = {
  intro: "bg-content4 text-foreground",
  tip: "bg-content3 text-foreground",
  outro: "bg-content2 text-foreground",
};

export default function SceneCard({
  scene,
  index,
  font,
  onChange,
  onDelete,
}: SceneCardProps) {
  const fontStyle = font ? { fontFamily: `"${font}", sans-serif` } : undefined;
  const update = (partial: Partial<Scene>) => {
    onChange({ ...scene, ...partial });
  };

  const narrationLen = scene.narration.length;
  const narrationColor =
    narrationLen > 50
      ? "text-danger font-bold"
      : narrationLen > 40
      ? "text-warning font-bold"
      : "text-subtext";

  return (
    <div className="neo-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-foreground/30" />
          <span
            className={cn(
              "memphis-badge",
              SCENE_TYPE_COLORS[scene.type] || "bg-content2 text-foreground"
            )}
          >
            Scene {index + 1}
          </span>
          <select
            className="memphis-select !w-auto !py-1 !px-3 !text-xs !border-2 !pr-8"
            value={scene.type}
            onChange={(e) => update({ type: e.target.value as SceneType })}
          >
            {SCENE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-subtext font-medium">{scene.id}</span>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="neo-btn neo-btn-ghost !border-0 !p-1.5 text-foreground/40 hover:text-danger"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Heading */}
      <label className="block text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-subtext mb-1 block">
          Heading
        </span>
        <input
          type="text"
          className="memphis-input text-center max-w-[15em] mx-auto"
          placeholder="씬 제목을 입력하세요"
          style={fontStyle}
          value={scene.heading}
          onChange={(e) => update({ heading: e.target.value })}
        />
      </label>

      {/* Narration */}
      <label className="block text-center">
        <div className="flex justify-center items-center gap-3 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-subtext">
            Narration
          </span>
          <span className={cn("text-xs font-bold", narrationColor)}>
            {narrationLen}/50
          </span>
        </div>
        <textarea
          className="memphis-textarea text-center max-w-[15em] mx-auto"
          rows={3}
          placeholder="나레이션 텍스트&#10;(15자 이내로 줄바꿈)"
          style={fontStyle}
          value={scene.narration}
          onChange={(e) => update({ narration: e.target.value })}
        />
      </label>

      {/* Visual Type */}
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-subtext mb-1 block">
          Visual Type
        </span>
        <select
          className="memphis-select"
          value={scene.visual.type}
          onChange={(e) => {
            const newType = e.target.value as VisualType;
            update({
              visual: { type: newType, data: {} },
            });
          }}
        >
          {VISUAL_TYPES.map((vt) => (
            <option key={vt.value} value={vt.value}>
              {vt.label}
            </option>
          ))}
        </select>
      </label>

      {/* Visual Data Form */}
      <VisualDataForm
        visualType={scene.visual.type}
        data={scene.visual.data}
        sceneId={scene.id}
        font={font}
        onChange={(data) =>
          update({ visual: { ...scene.visual, data } })
        }
      />
    </div>
  );
}
