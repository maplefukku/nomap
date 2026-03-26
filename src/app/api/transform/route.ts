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

  const body = await request.json();
  const { rejections } = body;

  if (!Array.isArray(rejections) || rejections.length === 0) {
    return NextResponse.json(
      { error: "拒否リストが空です" },
      { status: 400 }
    );
  }

  const results = await transformRejections(rejections, apiKey);
  return NextResponse.json({ results });
}
