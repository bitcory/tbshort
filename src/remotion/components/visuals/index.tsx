// ============================================
// Visual 컴포넌트 (테마 + 폰트 지원)
// ============================================
import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useThemeColors, useFontFamily } from "../../ThemeContext";
import type {
  StepFlowData,
  CodeBlockData,
  ComparisonData,
  NumberedListData,
  TipCardData,
  ChecklistData,
  QuoteCardData,
  KeywordHighlightData,
  StatsCardData,
} from "../../types/index";

function useCardStyle() {
  const colors = useThemeColors();
  return {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 16,
    padding: "48px 60px",
  };
}

// ============================================
export function StepFlow({ data }: { data: StepFlowData }) {
  const colors = useThemeColors();
  const fontFamily = useFontFamily();
  const cardStyle = useCardStyle();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 80px",
        gap: 32,
      }}
    >
      {(data.steps || []).map((step, i) => {
        const delay = i * 8;
        const opacity = spring({
          frame: frame - delay,
          fps,
          config: { damping: 20 },
        });

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 40,
              opacity,
              transform: `translateX(${interpolate(opacity, [0, 1], [-40, 0])}px)`,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "transparent",
                border: `3px solid ${colors.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                fontWeight: 900,
                color: colors.subtext,
                flexShrink: 0,
              }}
            >
              {step.icon || i + 1}
            </div>
            <div
              style={{
                ...cardStyle,
                flex: 1,
                fontSize: 44,
                fontFamily,
                fontWeight: 700,
                color: colors.text,
              }}
            >
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
export function CodeBlock({ data }: { data: CodeBlockData }) {
  const colors = useThemeColors();

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        padding: "0 60px",
      }}
    >
      <div
        style={{
          width: "100%",
          background: colors.codeBlockBg,
          border: `1px solid ${colors.codeBlockBorder}`,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {/* 상단 바 */}
        <div
          style={{
            background: colors.codeBlockBar,
            padding: "20px 30px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {["#FF5F57", "#FFBD2E", "#28C840"].map((c, i) => (
            <div
              key={i}
              style={{ width: 20, height: 20, borderRadius: "50%", background: c }}
            />
          ))}
          <span
            style={{
              marginLeft: 16,
              color: colors.codeBlockMeta,
              fontSize: 30,
              fontFamily: "monospace",
            }}
          >
            {data.language}
          </span>
        </div>

        {/* 코드 */}
        <div
          style={{
            padding: "40px 40px",
            fontSize: 38,
            fontFamily: '"JetBrains Mono", "Courier New", monospace',
            color: colors.codeBlockText,
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
          {data.code}
        </div>
      </div>
    </div>
  );
}

// ============================================
export function Comparison({ data }: { data: ComparisonData }) {
  const colors = useThemeColors();
  const fontFamily = useFontFamily();
  const cardStyle = useCardStyle();
  const items = data.items || [];

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "40px 60px",
        gap: 24,
      }}
    >
      {/* 헤더 */}
      <div style={{ display: "flex", gap: 24 }}>
        {[data.leftLabel || "A", data.rightLabel || "B"].map((label, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 44,
              fontFamily,
              fontWeight: 900,
              color: colors.text,
              padding: "20px",
              background: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
            }}
          >
            {i === 0 ? "A" : "B"} · {label}
          </div>
        ))}
      </div>

      {/* 아이템 */}
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
          {[item.left || "", item.right || ""].map((text, j) => (
            <div
              key={j}
              style={{
                flex: 1,
                ...cardStyle,
                fontSize: 36,
                fontFamily,
                color: colors.text,
                textAlign: "center",
              }}
            >
              {text}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================
export function NumberedList({ data }: { data: NumberedListData }) {
  const colors = useThemeColors();
  const fontFamily = useFontFamily();
  const cardStyle = useCardStyle();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 80px",
        gap: 28,
      }}
    >
      {(data.items || []).map((item, i) => {
        const opacity = spring({
          frame: frame - i * 6,
          fps,
          config: { damping: 20 },
        });

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
              opacity,
              transform: `translateY(${interpolate(opacity, [0, 1], [20, 0])}px)`,
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: colors.subtext,
                width: 60,
                textAlign: "center",
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <div
              style={{
                ...cardStyle,
                flex: 1,
                fontSize: 42,
                fontFamily,
                fontWeight: 600,
                color: colors.text,
              }}
            >
              {item}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
export function TipCard({ data }: { data: TipCardData }) {
  const colors = useThemeColors();
  const fontFamily = useFontFamily();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 18 } });

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
      }}
    >
      <div
        style={{
          width: "100%",
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          padding: "80px 70px",
          textAlign: "center",
          transform: `scale(${scale})`,
        }}
      >
        <div style={{ fontSize: 120, marginBottom: 32 }}>
          {data.emoji || "💡"}
        </div>
        <div
          style={{
            fontSize: 36,
            color: colors.subtext,
            fontFamily,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          TIP {data.number}
        </div>
        <div
          style={{
            fontSize: 56,
            color: colors.text,
            fontFamily,
            fontWeight: 900,
            lineHeight: 1.3,
            marginBottom: 32,
          }}
        >
          {data.title}
        </div>
        <div
          style={{
            fontSize: 40,
            color: colors.subtext,
            fontFamily,
            fontWeight: 400,
            lineHeight: 1.6,
          }}
        >
          {data.description}
        </div>
      </div>
    </div>
  );
}

// ============================================
export function ChecklistVisual({ data }: { data: ChecklistData }) {
  const colors = useThemeColors();
  const fontFamily = useFontFamily();
  const cardStyle = useCardStyle();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 80px",
        gap: 28,
      }}
    >
      {(data.items || []).map((item, i) => {
        const opacity = spring({
          frame: frame - i * 8,
          fps,
          config: { damping: 20 },
        });

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
              ...cardStyle,
              opacity,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: "transparent",
                border: `3px solid ${item.checked ? colors.text : colors.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                color: colors.text,
                flexShrink: 0,
              }}
            >
              {item.checked ? "✓" : ""}
            </div>
            <div
              style={{
                fontSize: 42,
                fontFamily,
                fontWeight: 600,
                color: item.checked ? colors.text : colors.subtext,
              }}
            >
              {item.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
export function QuoteCard({ data }: { data: QuoteCardData }) {
  const colors = useThemeColors();
  const fontFamily = useFontFamily();
  const cardStyle = useCardStyle();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = spring({ frame, fps, config: { damping: 15 } });

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
        opacity,
      }}
    >
      <div
        style={{
          width: "100%",
          ...cardStyle,
          borderLeft: `8px solid ${colors.border}`,
          textAlign: "left",
        }}
      >
        <div
          style={{
            fontSize: 100,
            color: colors.subtext,
            lineHeight: 0.5,
            marginBottom: 40,
          }}
        >
          "
        </div>
        <div
          style={{
            fontSize: 50,
            fontFamily,
            fontWeight: 700,
            color: colors.text,
            lineHeight: 1.5,
            marginBottom: 40,
          }}
        >
          {data.quote}
        </div>
        {data.author && (
          <div
            style={{
              fontSize: 36,
              color: colors.subtext,
              fontFamily,
            }}
          >
            — {data.author}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
export function KeywordHighlight({ data }: { data: KeywordHighlightData }) {
  const colors = useThemeColors();
  const fontFamily = useFontFamily();
  const words = (data.text || "").split(" ");
  const keywords = data.keywords || [];

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
      }}
    >
      <div
        style={{
          fontSize: 54,
          fontFamily,
          fontWeight: 700,
          color: colors.text,
          lineHeight: 1.8,
          textAlign: "center",
        }}
      >
        {words.map((word, i) => {
          const isKeyword = keywords.some((k) =>
            word.includes(k)
          );
          return (
            <span
              key={i}
              style={{
                color: isKeyword ? colors.accent : colors.text,
                fontWeight: isKeyword ? 900 : 700,
                textDecoration: isKeyword ? "underline" : "none",
                textDecorationColor: isKeyword ? colors.accent : undefined,
                textUnderlineOffset: "6px",
              }}
            >
              {word}{" "}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
export function StatsCard({ data }: { data: StatsCardData }) {
  const colors = useThemeColors();
  const fontFamily = useFontFamily();
  const cardStyle = useCardStyle();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 60px",
        gap: 32,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: (data.stats || []).length <= 2 ? "1fr 1fr" : "1fr 1fr 1fr",
          gap: 32,
        }}
      >
        {(data.stats || []).map((stat, i) => {
          const opacity = spring({
            frame: frame - i * 6,
            fps,
            config: { damping: 20 },
          });

          return (
            <div
              key={i}
              style={{
                ...cardStyle,
                textAlign: "center",
                opacity,
                transform: `scale(${interpolate(opacity, [0, 1], [0.8, 1])})`,
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 900,
                  color: colors.text,
                  fontFamily,
                  lineHeight: 1,
                  marginBottom: 16,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 36,
                  color: colors.subtext,
                  fontFamily,
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
