import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const PROJECT_ROOT = join(process.cwd(), "..");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const sceneId = formData.get("sceneId") as string | null;

    if (!file || !sceneId) {
      return NextResponse.json(
        { error: "file과 sceneId가 필요합니다" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "png";
    const filename = `${sceneId}.${ext}`;

    // output/images/ 에 저장
    const outputImagesDir = join(PROJECT_ROOT, "output", "images");
    await mkdir(outputImagesDir, { recursive: true });
    await writeFile(join(outputImagesDir, filename), buffer);

    // public/images/ 에도 저장 (Remotion staticFile용)
    const publicImagesDir = join(PROJECT_ROOT, "public", "images");
    await mkdir(publicImagesDir, { recursive: true });
    await writeFile(join(publicImagesDir, filename), buffer);

    return NextResponse.json({
      imagePath: `images/${filename}`,
      filename,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "업로드 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
