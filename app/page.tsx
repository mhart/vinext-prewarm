import Link from "next/link";

export const dynamic = "force-dynamic";

const routes = [
  ["/cached/intro", "App Router ISR"],
  ["/cached/featured", "Tagged ISR"],
  ["/catalog/item-01", "generateStaticParams"],
  ["/api/now", "Static Route Handler"],
  ["/dynamic", "Cookie-dependent bypass"],
  ["/api/vary", "Vary response"],
] as const;

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
        Vinext prewarm test fixture
      </p>
      <h1 className="mt-3 text-4xl font-semibold">Workers Response Store</h1>
      <p className="mt-4 text-slate-700">
        This page is intentionally dynamic. Use the routes below to exercise deploy-time warming,
        ISR reuse, tag/path revalidation, and cache-safety exclusions.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {routes.map(([href, label]) => (
          <li className="rounded-lg border border-slate-200 bg-white p-5" key={href}>
            <strong>{label}</strong>
            <br />
            <Link className="text-orange-700 underline" href={href} prefetch={false}>
              {href}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-slate-600">
        Build: <code>{process.env.__VINEXT_BUILD_ID ?? "development"}</code>
      </p>
    </main>
  );
}
