"use client";

import { Plus, X, Copy, ClipboardPaste } from "lucide-react";
import { VISUAL_META } from "@/lib/constants";
import type { VisualType } from "@/lib/types";
import ImageUploader from "./ImageUploader";

interface VisualDataFormProps {
  visualType: VisualType;
  data: Record<string, unknown>;
  sceneId: string;
  font?: string;
  onChange: (data: Record<string, unknown>) => void;
}

export default function VisualDataForm({
  visualType,
  data,
  sceneId,
  font,
  onChange,
}: VisualDataFormProps) {
  const meta = VISUAL_META[visualType];
  if (!meta || meta.fields.length === 0) return null;

  const fontStyle = font ? { fontFamily: `"${font}", sans-serif` } : undefined;

  const update = (key: string, value: unknown) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-3 mt-2 pl-4 border-l-[3px] border-primary/30">
      {meta.fields.map((field) => {
        const val = data[field.key];

        switch (field.type) {
          case "text":
            return (
              <label key={field.key} className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-subtext mb-1 block">
                  {field.label}
                </span>
                <input
                  type="text"
                  className="memphis-input"
                  placeholder={field.placeholder}
                  style={fontStyle}
                  value={(val as string) || ""}
                  onChange={(e) => update(field.key, e.target.value)}
                />
              </label>
            );

          case "textarea":
          case "code":
            return (
              <div key={field.key} className="block">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-subtext">
                    {field.label}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      title="복사"
                      className="neo-btn neo-btn-ghost !border-0 !p-1 text-foreground/30 hover:text-primary"
                      onClick={() => {
                        const text = (val as string) || "";
                        if (text) navigator.clipboard.writeText(text);
                      }}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="붙여넣기"
                      className="neo-btn neo-btn-ghost !border-0 !p-1 text-foreground/30 hover:text-primary"
                      onClick={async () => {
                        const text = await navigator.clipboard.readText();
                        if (text) update(field.key, text);
                      }}
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <textarea
                  className={`memphis-textarea ${field.type === "code" ? "json-editor" : ""}`}
                  rows={field.type === "code" ? 5 : 3}
                  placeholder={field.placeholder}
                  style={field.type === "code" ? undefined : fontStyle}
                  value={(val as string) || ""}
                  onChange={(e) => update(field.key, e.target.value)}
                />
              </div>
            );

          case "number":
            return (
              <label key={field.key} className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-subtext mb-1 block">
                  {field.label}
                </span>
                <input
                  type="number"
                  className="memphis-input"
                  placeholder={field.placeholder}
                  value={(val as number) ?? ""}
                  onChange={(e) =>
                    update(
                      field.key,
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
              </label>
            );

          case "tags":
            return (
              <TagsField
                key={field.key}
                label={field.label}
                placeholder={field.placeholder || ""}
                values={(val as string[]) || []}
                onChange={(v) => update(field.key, v)}
              />
            );

          case "items":
            return (
              <ItemsField
                key={field.key}
                label={field.label}
                placeholder={field.placeholder || ""}
                values={(val as string[]) || []}
                onChange={(v) => update(field.key, v)}
              />
            );

          case "checklist-items":
            return (
              <ChecklistField
                key={field.key}
                label={field.label}
                values={
                  (val as { text: string; checked: boolean }[]) || []
                }
                onChange={(v) => update(field.key, v)}
              />
            );

          case "step-items":
            return (
              <StepItemsField
                key={field.key}
                label={field.label}
                values={(val as { label: string; icon?: string }[]) || []}
                onChange={(v) => update(field.key, v)}
              />
            );

          case "comparison-items":
            return (
              <ComparisonField
                key={field.key}
                label={field.label}
                values={(val as { left: string; right: string }[]) || []}
                onChange={(v) => update(field.key, v)}
              />
            );

          case "bar-items":
            return (
              <BarItemsField
                key={field.key}
                label={field.label}
                values={
                  (val as { label: string; value: number }[]) || []
                }
                onChange={(v) => update(field.key, v)}
              />
            );

          case "stat-items":
            return (
              <StatItemsField
                key={field.key}
                label={field.label}
                values={
                  (val as { value: string; label: string }[]) || []
                }
                onChange={(v) => update(field.key, v)}
              />
            );

          default:
            return null;
        }
      })}

      {visualType === "image-caption" && (
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-subtext mb-1 block">
            이미지
          </span>
          <ImageUploader
            sceneId={sceneId}
            currentPath={data.imagePath as string | undefined}
            onUpload={(path) => update("imagePath", path)}
          />
        </div>
      )}
    </div>
  );
}

// === Sub Components ===

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="neo-btn neo-btn-ghost !border-0 !p-1 text-foreground/30 hover:text-danger"
      onClick={onClick}
    >
      <X className="w-3.5 h-3.5" />
    </button>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className="neo-btn neo-btn-ghost !border-2 !border-dashed !border-foreground/20 px-3 py-1.5 text-xs text-subtext hover:text-primary hover:!border-primary"
      onClick={onClick}
    >
      <Plus className="w-3 h-3 mr-1" />
      {label}
    </button>
  );
}

function TagsField({
  label,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-wider text-subtext mb-1 block">
        {label}
      </span>
      <div className="flex flex-wrap gap-2 mt-1">
        {values.map((tag, i) => (
          <span key={i} className="neo-tag">
            {tag}
            <button
              type="button"
              className="text-foreground/40 hover:text-danger"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          className="memphis-input !w-28 !py-1.5 !px-2.5 !text-sm !border-2"
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.currentTarget.value.trim()) {
              e.preventDefault();
              onChange([...values, e.currentTarget.value.trim()]);
              e.currentTarget.value = "";
            }
          }}
        />
      </div>
    </div>
  );
}

function ItemsField({
  label,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-wider text-subtext mb-1 block">
        {label}
      </span>
      <div className="space-y-2 mt-1">
        {values.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              className="memphis-input !border-2"
              value={item}
              onChange={(e) => {
                const next = [...values];
                next[i] = e.target.value;
                onChange(next);
              }}
            />
            <RemoveButton onClick={() => onChange(values.filter((_, j) => j !== i))} />
          </div>
        ))}
        <AddButton label={placeholder || "추가"} onClick={() => onChange([...values, ""])} />
      </div>
    </div>
  );
}

function ChecklistField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: { text: string; checked: boolean }[];
  onChange: (v: { text: string; checked: boolean }[]) => void;
}) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-wider text-subtext mb-1 block">
        {label}
      </span>
      <div className="space-y-2 mt-1">
        {values.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="checkbox"
              className="w-5 h-5 accent-primary border-2 border-foreground rounded cursor-pointer"
              checked={item.checked}
              onChange={(e) => {
                const next = [...values];
                next[i] = { ...next[i], checked: e.target.checked };
                onChange(next);
              }}
            />
            <input
              type="text"
              className="memphis-input !border-2"
              value={item.text}
              onChange={(e) => {
                const next = [...values];
                next[i] = { ...next[i], text: e.target.value };
                onChange(next);
              }}
            />
            <RemoveButton onClick={() => onChange(values.filter((_, j) => j !== i))} />
          </div>
        ))}
        <AddButton label="항목 추가" onClick={() => onChange([...values, { text: "", checked: false }])} />
      </div>
    </div>
  );
}

function StepItemsField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: { label: string; icon?: string }[];
  onChange: (v: { label: string; icon?: string }[]) => void;
}) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-wider text-subtext mb-1 block">
        {label}
      </span>
      <div className="space-y-2 mt-1">
        {values.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              className="memphis-input !w-14 !border-2 !text-center"
              placeholder="icon"
              value={item.icon || ""}
              onChange={(e) => {
                const next = [...values];
                next[i] = { ...next[i], icon: e.target.value || undefined };
                onChange(next);
              }}
            />
            <input
              type="text"
              className="memphis-input !border-2"
              placeholder="단계 이름"
              value={item.label}
              onChange={(e) => {
                const next = [...values];
                next[i] = { ...next[i], label: e.target.value };
                onChange(next);
              }}
            />
            <RemoveButton onClick={() => onChange(values.filter((_, j) => j !== i))} />
          </div>
        ))}
        <AddButton label="단계 추가" onClick={() => onChange([...values, { label: "" }])} />
      </div>
    </div>
  );
}

function ComparisonField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: { left: string; right: string }[];
  onChange: (v: { left: string; right: string }[]) => void;
}) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-wider text-subtext mb-1 block">
        {label}
      </span>
      <div className="space-y-2 mt-1">
        {values.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              className="memphis-input !border-2"
              placeholder="왼쪽"
              value={item.left}
              onChange={(e) => {
                const next = [...values];
                next[i] = { ...next[i], left: e.target.value };
                onChange(next);
              }}
            />
            <span className="text-sm font-black text-subtext shrink-0">VS</span>
            <input
              type="text"
              className="memphis-input !border-2"
              placeholder="오른쪽"
              value={item.right}
              onChange={(e) => {
                const next = [...values];
                next[i] = { ...next[i], right: e.target.value };
                onChange(next);
              }}
            />
            <RemoveButton onClick={() => onChange(values.filter((_, j) => j !== i))} />
          </div>
        ))}
        <AddButton label="비교 항목 추가" onClick={() => onChange([...values, { left: "", right: "" }])} />
      </div>
    </div>
  );
}

function BarItemsField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: { label: string; value: number }[];
  onChange: (v: { label: string; value: number }[]) => void;
}) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-wider text-subtext mb-1 block">
        {label}
      </span>
      <div className="space-y-2 mt-1">
        {values.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              className="memphis-input !border-2"
              placeholder="라벨"
              value={item.label}
              onChange={(e) => {
                const next = [...values];
                next[i] = { ...next[i], label: e.target.value };
                onChange(next);
              }}
            />
            <input
              type="number"
              className="memphis-input !w-24 !border-2"
              placeholder="값"
              value={item.value}
              onChange={(e) => {
                const next = [...values];
                next[i] = { ...next[i], value: Number(e.target.value) };
                onChange(next);
              }}
            />
            <RemoveButton onClick={() => onChange(values.filter((_, j) => j !== i))} />
          </div>
        ))}
        <AddButton label="데이터 추가" onClick={() => onChange([...values, { label: "", value: 0 }])} />
      </div>
    </div>
  );
}

function StatItemsField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: { value: string; label: string }[];
  onChange: (v: { value: string; label: string }[]) => void;
}) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-wider text-subtext mb-1 block">
        {label}
      </span>
      <div className="space-y-2 mt-1">
        {values.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              className="memphis-input !w-28 !border-2"
              placeholder="수치"
              value={item.value}
              onChange={(e) => {
                const next = [...values];
                next[i] = { ...next[i], value: e.target.value };
                onChange(next);
              }}
            />
            <input
              type="text"
              className="memphis-input !border-2"
              placeholder="라벨"
              value={item.label}
              onChange={(e) => {
                const next = [...values];
                next[i] = { ...next[i], label: e.target.value };
                onChange(next);
              }}
            />
            <RemoveButton onClick={() => onChange(values.filter((_, j) => j !== i))} />
          </div>
        ))}
        <AddButton label="통계 추가" onClick={() => onChange([...values, { value: "", label: "" }])} />
      </div>
    </div>
  );
}
