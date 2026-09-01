import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { CONTENT_CACHE_TAG } from "@/features/content/services";

export async function POST(request: Request): Promise<NextResponse> {
  const expected = process.env.WEB_REVALIDATE_SECRET;
  const provided = request.headers.get("x-revalidate-secret");

  if (!expected || provided !== expected) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  revalidateTag(CONTENT_CACHE_TAG, "max");

  return NextResponse.json({ revalidated: true, tag: CONTENT_CACHE_TAG });
}
