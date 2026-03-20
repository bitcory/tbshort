"use client";

import { useState, useCallback } from "react";
import { Upload, CheckCircle2, Loader2, ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  sceneId: string;
  currentPath?: string;
  onUpload: (imagePath: string) => void;
}

export default function ImageUploader({
  sceneId,
  currentPath,
  onUpload,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sceneId", sceneId);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("업로드 실패");

        const { imagePath } = await res.json();
        onUpload(imagePath);
      } catch (err) {
        console.error("이미지 업로드 오류:", err);
      } finally {
        setUploading(false);
      }
    },
    [sceneId, onUpload]
  );

  return (
    <div
      className={`relative border-[3px] border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
        dragOver
          ? "border-primary bg-content3/50 scale-[1.01]"
          : currentPath
          ? "border-primary/40 bg-content3/20"
          : "border-foreground/20 hover:border-primary/50 hover:bg-content2/30"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = () => {
          const file = input.files?.[0];
          if (file) handleFile(file);
        };
        input.click();
      }}
    >
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-bold text-foreground">업로드 중...</p>
        </div>
      ) : currentPath ? (
        <div className="flex flex-col items-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-primary" strokeWidth={2.5} />
          <p
            className="text-sm font-bold text-primary select-all cursor-text"
            onClick={(e) => e.stopPropagation()}
          >
            {currentPath}
          </p>
          <p className="text-xs text-subtext font-medium">클릭하여 변경</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-lg bg-content2 border-2 border-foreground/10 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-foreground/40" />
          </div>
          <p className="text-sm font-bold text-foreground/60">
            이미지를 드래그하거나 클릭하여 업로드
          </p>
          <p className="text-xs text-subtext">PNG, JPG, WebP</p>
        </div>
      )}
    </div>
  );
}
