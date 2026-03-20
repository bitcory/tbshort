#!/usr/bin/env python3
"""
aitoolbee-shorts TTS 생성기
edge-tts를 사용해 씬별 MP3 + 타임스탬프 JSON 생성
"""

import asyncio
import json
import sys
import os
from pathlib import Path
import edge_tts

# 기본 음성 (script에서 voice 지정 안 하면 사용)
DEFAULT_VOICE = "ko-KR-SunHiNeural"
# 말하기 속도 (숏폼은 약간 빠른게 좋음)
RATE = "+10%"
# 볼륨
VOLUME = "+0%"


async def synthesize_scene(
    scene_id: str,
    text: str,
    output_dir: str,
    voice: str = DEFAULT_VOICE
) -> dict:
    """단일 씬 TTS 합성 + 타임스탬프 추출"""

    audio_path = os.path.abspath(os.path.join(output_dir, f"{scene_id}.mp3"))
    timestamps_path = os.path.join(output_dir, f"{scene_id}_timestamps.json")

    communicate = edge_tts.Communicate(
        text=text,
        voice=voice,
        rate=RATE,
        volume=VOLUME
    )

    # 타임스탬프 수집
    timestamps = []
    audio_chunks = []

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_chunks.append(chunk["data"])
        elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
            timestamps.append({
                "text": chunk["text"],
                "startMs": chunk["offset"] // 10000,  # 100ns → ms
                "endMs": (chunk["offset"] + chunk["duration"]) // 10000
            })

    # MP3 저장
    with open(audio_path, "wb") as f:
        for chunk in audio_chunks:
            f.write(chunk)

    # 전체 오디오 길이 계산
    if timestamps:
        duration_ms = timestamps[-1]["endMs"]
    else:
        # 타임스탬프 없으면 MP3 파일 크기로 추정 (128kbps 기준)
        file_size = os.path.getsize(audio_path)
        duration_ms = int(file_size * 8 / 128)  # bits / bitrate

    # 타임스탬프 저장
    result = {
        "sceneId": scene_id,
        "audioPath": audio_path,
        "durationMs": duration_ms,
        "timestamps": timestamps
    }

    with open(timestamps_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"  ✅ {scene_id}: {duration_ms}ms ({len(timestamps)}단어)")
    return result


async def main():
    if len(sys.argv) < 3:
        print("Usage: python tts.py <script.json> <output_dir>")
        sys.exit(1)

    script_path = sys.argv[1]
    output_dir = sys.argv[2]

    Path(output_dir).mkdir(parents=True, exist_ok=True)

    with open(script_path, "r", encoding="utf-8") as f:
        script = json.load(f)

    voice = script.get("voice", DEFAULT_VOICE)
    print(f"\n🎙️ TTS 생성 시작: {len(script['scenes'])}개 씬 (음성: {voice})")

    results = []
    for scene in script["scenes"]:
        narration = (scene.get("narration") or "").strip()
        if not narration:
            print(f"  ⏭️ {scene['id']}: 나레이션 없음 — 건너뜀")
            continue
        result = await synthesize_scene(
            scene_id=scene["id"],
            text=narration,
            output_dir=output_dir,
            voice=voice
        )
        results.append(result)

    # 전체 결과 저장
    summary_path = os.path.join(output_dir, "tts_results.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    total_ms = sum(r["durationMs"] for r in results)
    print(f"\n✅ TTS 완료: 총 {total_ms/1000:.1f}초")
    print(f"📁 저장 위치: {summary_path}")


if __name__ == "__main__":
    asyncio.run(main())
