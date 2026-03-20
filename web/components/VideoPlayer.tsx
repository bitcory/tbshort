"use client";

import { Download, Play } from "lucide-react";

interface VideoPlayerProps {
  filename: string;
}

export default function VideoPlayer({ filename }: VideoPlayerProps) {
  const downloadUrl = `/api/download/${encodeURIComponent(filename)}`;

  return (
    <div className="neo-card overflow-hidden">
      <div className="px-5 py-3 border-b-[3px] border-foreground flex items-center gap-2">
        <Play className="w-4 h-4 text-primary" strokeWidth={3} />
        <h3 className="text-sm font-black uppercase tracking-wider">
          생성된 영상
        </h3>
      </div>

      <div className="p-4">
        <video
          className="w-full rounded-lg border-[3px] border-foreground bg-foreground"
          controls
          src={downloadUrl}
        />

        <a
          href={downloadUrl}
          download={filename}
          className="neo-btn neo-btn-primary w-full py-2.5 text-sm mt-4"
        >
          <Download className="w-4 h-4 mr-2" />
          다운로드 ({filename})
        </a>
      </div>
    </div>
  );
}
