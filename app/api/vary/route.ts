export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const variant = request.headers.get("x-cache-variant") ?? "missing";
  return Response.json(
    { variant, renderId: crypto.randomUUID() },
    { headers: { "Cache-Control": "public, s-maxage=300", Vary: "x-cache-variant" } },
  );
}
