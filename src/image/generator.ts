import { writeFile, mkdir, cp } from "fs/promises";
import { join } from "path";
import type { Script, ImageCaptionData } from "../types/index.js";

const MODEL_ID = "black-forest-labs/FLUX.1-schnell";
const API_URL = `https://router.huggingface.co/hf-inference/models/${MODEL_ID}`;

async function textToImage(prompt: string, token: string): Promise<Buffer> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { width: 720, height: 1280 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HF API ${res.status}: ${err}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

export async function generateImages(
  script: Script,
  outputDir: string
): Promise<Script> {
  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    console.warn("\n⚠️ HF_TOKEN 환경변수가 없습니다. 이미지 생성을 건너뜁니다.");
    return script;
  }

  const imageDir = join(outputDir, "images");
  const publicImageDir = join("public", "images");
  await mkdir(imageDir, { recursive: true });
  await mkdir(publicImageDir, { recursive: true });

  const imageCaptionScenes = script.scenes.filter(
    (s) => s.visual.type === "image-caption"
  );

  if (imageCaptionScenes.length === 0) {
    console.log("\n📸 image-caption 씬이 없어 이미지 생성을 건너뜁니다.");
    return script;
  }

  console.log(`\n🎨 이미지 생성 시작 (${imageCaptionScenes.length}장)...`);

  for (const scene of imageCaptionScenes) {
    const data = scene.visual.data as unknown as ImageCaptionData;
    const fileName = `${scene.id}.png`;
    const outputPath = join(imageDir, fileName);
    const publicPath = join(publicImageDir, fileName);

    // characterDescription이 있으면 프롬프트에 추가
    let prompt = data.imagePrompt;
    if (script.characterDescription) {
      prompt = `${prompt}. The main character: ${script.characterDescription}`;
    }
    // 9:16 세로 구도 강조
    prompt = `${prompt}, vertical 9:16 portrait orientation, high quality, detailed`;

    console.log(`  🖼️  ${scene.id}: ${data.caption}`);

    try {
      const buffer = await textToImage(prompt, hfToken);
      await writeFile(outputPath, buffer);
      await cp(outputPath, publicPath);

      // 스크립트에 imagePath 기록
      (scene.visual.data as Record<string, unknown>).imagePath = `images/${fileName}`;
      console.log(`  ✅ ${scene.id} 저장 완료`);
    } catch (err: any) {
      console.warn(`  ⚠️ ${scene.id} 이미지 생성 실패: ${err.message}`);
    }
  }

  console.log(`🎨 이미지 생성 완료`);
  return script;
}
