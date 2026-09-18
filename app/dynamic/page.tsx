import { cookies } from "next/headers";

export const revalidate = 60;

export default async function DynamicPage() {
  const viewer = (await cookies()).get("viewer")?.value ?? "anonymous";
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-semibold">Dynamic safety control</h1>
      <p data-testid="viewer">Viewer: {viewer}</p>
      <p data-testid="render-id">Render: {crypto.randomUUID()}</p>
      <p>This response must not be shared between visitors or prewarmed.</p>
    </main>
  );
}
