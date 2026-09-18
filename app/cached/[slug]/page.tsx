import Link from "next/link";

export const revalidate = 3600;

export function generateStaticParams() {
  return [{ slug: "intro" }, { slug: "featured" }];
}

async function taggedData(slug: string) {
  await fetch(`data:application/json,${encodeURIComponent(JSON.stringify({ slug }))}`, {
    next: { revalidate: 3600, tags: [`post:${slug}`] },
  });
  return slug;
}

export default async function CachedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await taggedData(slug);
  const renderedAt = new Date().toISOString();
  const renderId = crypto.randomUUID();

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/">← Home</Link>
      <h1 className="mt-6 text-3xl font-semibold">ISR: {slug}</h1>
      <dl className="mt-6 grid grid-cols-[10rem_1fr] gap-2">
        <dt>Build ID</dt><dd data-testid="build-id">{process.env.__VINEXT_BUILD_ID}</dd>
        <dt>Rendered at</dt><dd data-testid="rendered-at">{renderedAt}</dd>
        <dt>Render ID</dt><dd data-testid="render-id">{renderId}</dd>
        <dt>Cache tag</dt><dd>post:{slug}</dd>
      </dl>
    </main>
  );
}
