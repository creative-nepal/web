import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

function safeSlug(value: string | null): string {
  return value && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? value : "";
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const slug = safeSlug(searchParams.get("slug"));
  const target = new URL(`/${slug}`, request.url);

  if (searchParams.get("disable") === "1") {
    (await draftMode()).disable();
    return NextResponse.redirect(target);
  }

  const expected = process.env.CONTENT_PREVIEW_SECRET;

  if (!expected || searchParams.get("secret") !== expected) {
    return new NextResponse("Invalid preview secret", { status: 401 });
  }

  (await draftMode()).enable();

  return NextResponse.redirect(target);
}
