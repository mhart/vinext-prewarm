export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    message: "Hello from vinext on Cloudflare Workers",
    buildId: process.env.__VINEXT_BUILD_ID,
  });
}
