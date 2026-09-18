export const revalidate = 3600;

export function generateStaticParams() {
  return Array.from({ length: 64 }, (_, index) => ({
    slug: `item-${String(index + 1).padStart(2, "0")}`,
  }));
}

export default async function CatalogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-semibold">Catalog: {slug}</h1>
      <p data-testid="build-id">Build: {process.env.__VINEXT_BUILD_ID}</p>
      <p data-testid="render-id">Render: {crypto.randomUUID()}</p>
      <p data-testid="rendered-at">Rendered: {new Date().toISOString()}</p>
    </main>
  );
}
