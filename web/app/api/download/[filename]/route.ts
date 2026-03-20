import { NextRequest } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";

const PROJECT_ROOT = join(process.cwd(), "..");

async function tryReadFile(filePath: string) {
  const fileStat = await stat(filePath);
  const buffer = await readFile(filePath);
  return { fileStat, buffer };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename: rawFilename } = await params;
  const filename = decodeURIComponent(rawFilename);

  if (filename.includes("..") || filename.includes("/")) {
    return new Response("잘못된 파일명", { status: 400 });
  }

  // 파일명 후보: 원본 → 공백을 _로 변환 → _를 공백으로 변환
  const candidates = [
    filename,
    filename.replace(/\s+/g, "_"),
    filename.replace(/_/g, " "),
  ];

  for (const name of candidates) {
    const filePath = join(PROJECT_ROOT, "output", name);
    try {
      const { fileStat, buffer } = await tryReadFile(filePath);
      return new Response(buffer, {
        headers: {
          "Content-Type": "video/mp4",
          "Content-Length": fileStat.size.toString(),
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
        },
      });
    } catch {
      // 다음 후보 시도
    }
  }

  return new Response("파일을 찾을 수 없습니다", { status: 404 });
}
