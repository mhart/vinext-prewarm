import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { tag?: unknown };
  const tag = typeof body.tag === "string" ? body.tag.trim() : "";
  if (!tag) return Response.json({ error: "Missing tag" }, { status: 400 });
  await revalidateTag(tag, "default");
  return Response.json({ revalidated: true, tag });
}
