export const revalidate = 3600;

export function GET() {
  return Response.json({
    buildId: process.env.__VINEXT_BUILD_ID,
    renderedAt: new Date().toISOString(),
    renderId: crypto.randomUUID(),
  });
}
