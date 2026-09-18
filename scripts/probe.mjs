const origin = process.argv[2]?.replace(/\/$/, "");
if (!origin) {
  console.error("Usage: npm run probe -- https://your-test-domain.example");
  process.exit(1);
}

const routes = ["/cached/intro", "/cached/featured", "/catalog/item-01", "/api/now", "/dynamic"];

async function probe(path, headers = {}) {
  const started = performance.now();
  const response = await fetch(`${origin}${path}`, { headers, redirect: "manual" });
  await response.arrayBuffer();
  return {
    path,
    status: response.status,
    ms: Math.round(performance.now() - started),
    cfCache: response.headers.get("cf-cache-status"),
    vinextCache: response.headers.get("x-vinext-cache"),
    buildId: response.headers.get("x-vinext-build-id"),
    colo: response.headers.get("cf-ray")?.split("-").at(-1) ?? null,
  };
}

for (const path of routes) {
  const first = await probe(path);
  const second = await probe(path);
  console.log(JSON.stringify({ first, second }));
}

for (const variant of ["alpha", "beta"]) {
  console.log(JSON.stringify(await probe("/api/vary", { "x-cache-variant": variant })));
}
