import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { path?: unknown };
  const path = typeof body.path === "string" ? body.path.trim() : "";
  if (!path.startsWith("/")) {
    return Response.json({ error: "Path must start with /" }, { status: 400 });
  }
  await revalidatePath(path);
  return Response.json({ revalidated: true, path });
}
