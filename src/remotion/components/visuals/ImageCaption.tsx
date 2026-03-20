import React from "react";
import {
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { useThemeColors, useFontFamily } from "../../ThemeContext";
import type { ImageCaptionData } from "../../types/index";

export function ImageCaption({ data }: { data: ImageCaptionData }) {
  const colors = useThemeColors();
  const fontFamily = useFontFamily();
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = spring({ frame, fps, config: { damping: 20 } });

  // Ken Burns: 씬 동안 1.0 → 1.12 서서히 줌인
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.12], {
    extrapolateRight: "clamp",
  });

  // 캡션 슬라이드업
  const captionSlide = interpolate(fadeIn, [0, 1], [60, 0]);

  if (!data.imagePath) {
    // fallback: 이미지 없을 때 텍스트만 표시
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 80px",
          opacity: fadeIn,
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: 56,
            fontFamily,
            fontWeight: 900,
            color: colors.text,
            lineHeight: 1.4,
          }}
        >
          {data.caption}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* AI 생성 이미지 with Ken Burns 줌 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <Img
          src={staticFile(data.imagePath)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* 하단 그라디언트 오버레이 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
        }}
      />

      {/* 캡션 오버레이 */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          padding: "0 60px",
          opacity: fadeIn,
          transform: `translateY(${captionSlide}px)`,
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontFamily,
            fontWeight: 900,
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1.4,
            textShadow: "0 4px 20px rgba(0,0,0,0.8)",
          }}
        >
          {data.caption}
        </div>
      </div>
    </div>
  );
}
