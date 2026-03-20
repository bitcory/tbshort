# aitoolbee-shorts

> AI 숏폼 영상 자동 생성 파이프라인 🎬  
> `주제 입력 → 대본 → TTS → 영상` 원커맨드 자동화

---

## 아키텍처

```
CLI (topic 입력)
    ↓
Claude API → 대본 JSON (intro + tip × N + outro)
    ↓
edge-tts (Python) → 씬별 MP3 + 단어 타임스탬프
    ↓
Remotion → React 컴포넌트 → 1080×1920 MP4
```

---

## 설치

```bash
# 1. 의존성 설치
npm install

# 2. Python TTS 엔진 설치
pip install edge-tts

# 3. 환경 변수 설정
cp .env.example .env
# ANTHROPIC_API_KEY=sk-ant-...
```

---

## 사용법

### 주제만 넣으면 전자동

```bash
npx tsx src/cli/index.ts --topic "개발자 아침 루틴"
npx tsx src/cli/index.ts --topic "Cursor AI 완전 정복"
npx tsx src/cli/index.ts --topic "n8n 자동화 입문"
```

### 직접 만든 대본 JSON 사용

```bash
npx tsx src/cli/index.ts --json ./scripts/example-claude-code.json
```

### 대본만 생성 (렌더링 없이)

```bash
npx tsx src/cli/index.ts --topic "Midjourney v7 팁" --no-tts
```

---

## 대본 JSON 스키마

```json
{
  "topic": "string",
  "title": "유튜브 쇼츠 제목",
  "scenes": [
    {
      "id": "scene-1",
      "type": "intro | tip | outro",
      "heading": "상단 헤딩 (10자 이내)",
      "narration": "TTS 읽을 텍스트 (50자 이내 권장)",
      "visual": {
        "type": "VisualType",
        "data": { ... }
      }
    }
  ]
}
```

---

## Visual 타입 14종

| 타입 | 용도 |
|------|------|
| `step-flow` | 단계별 프로세스 |
| `code-block` | 명령어 / 코드 |
| `comparison` | A vs B 비교 |
| `numbered-list` | 순서 있는 목록 |
| `bar-chart` | 수치 비교 |
| `keyword-highlight` | 핵심 단어 강조 |
| `icon-text` | 아이콘 + 설명 |
| `checklist` | 체크리스트 |
| `quote-card` | 인용 / 명언 |
| `tip-card` | 단일 팁 강조 |
| `timeline` | 타임라인 |
| `stats-card` | 통계 숫자 |
| `image-caption` | 이미지 + 설명 |
| `none` | 텍스트만 |

---

## 레이아웃 (1080×1920)

```
┌─────────────────────┐
│   헤딩 (0~200px)    │
├─────────────────────┤
│                     │
│  Visual 영역        │
│  (200~1520px)       │
│                     │
├─────────────────────┤
│  자막 (1520~1920px) │
└─────────────────────┘
```

---

## Remotion 스튜디오 (미리보기)

```bash
npm run remotion:studio
```

---

## 출력 파일 구조

```
output/
├── script.json          # 생성된 대본
├── audio/
│   ├── scene-1.mp3      # 씬별 음성
│   ├── scene-1_timestamps.json
│   └── tts_results.json
└── {topic}.mp4          # 최종 영상
```

---

## Claude Code와 함께 쓰기

```bash
# 새 Visual 컴포넌트 추가
"BarChart 컴포넌트 추가해줘, visual.data에는 items 배열"

# 대본 수정
"scene-2의 visual을 comparison으로 바꿔줘"

# 브랜드 컬러 변경
"COLORS의 accent를 #FF6B35로 바꿔줘"
```
