import { NextRequest, NextResponse } from "next/server";
import { transformRejections } from "@/lib/ai/transform";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GLM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GLM API key not configured" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が不正です" },
      { status: 400 }
    );
  }

  const { rejections } = body as { rejections?: unknown };

  if (!Array.isArray(rejections) || rejections.length === 0) {
    return NextResponse.json(
      { error: "拒否リストが空です" },
      { status: 400 }
    );
  }

  try {
    const results = await transformRejections(rejections, apiKey);
    return NextResponse.json({ results });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "変換処理に失敗しました";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
