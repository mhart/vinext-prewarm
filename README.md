# Vinext prewarming test project

This is a purpose-built Cloudflare Vinext cache/prewarming fixture using the self-contained
Workers Response Store:

- Workers Cache for edge delivery
- R2 for response bodies
- SQLite Durable Objects for metadata
- `responseStoreAdapter` in self-contained mode
- deploy-time CDN warming and certification

## Test surface

- `/cached/intro` and `/cached/featured`: App Router ISR with cache tags
- `/catalog/item-01` … `/catalog/item-64`: `generateStaticParams()` scale fixture
- `/api/now`: cacheable Route Handler
- `/dynamic`: cookie-dependent response that must remain private
- `/api/vary`: two cache variants selected by `X-Cache-Variant`
- `/api/version`: uncached build identity
- `/api/revalidate-tag` and `/api/revalidate-path`: on-demand invalidation

Rendered pages include timestamps and UUIDs so cache reuse can be distinguished from a rerender.

This branch uses the Vinext PR builds that expose Response Store entrypoints during development,
stabilize cached variant selection, and coalesce Response Store metadata misses. Miniflare does not
currently expose `ctx.cache`, so use a deployed Worker to test Workers Cache and prewarming behavior.

The temporary package pins are Vinext [#3306](https://github.com/cloudflare/vinext/pull/3306),
`@vinext/cloudflare` [#3308](https://github.com/cloudflare/vinext/pull/3308), and Response Store
[#3304](https://github.com/cloudflare/vinext/pull/3304). The `package.json` override is intentional:
it prevents the Cloudflare PR artifact from installing its own older nested Response Store build.
Use `npm install --allow-remote=all` until equivalent npm releases are available.

## One-time setup

Authenticate and create the R2 bucket declared in `wrangler.jsonc`:

```sh
npx wrangler login
npx wrangler r2 bucket create vinext-prewarm-response-store-cache-bodies
```

If the project must deploy to a particular account, add `account_id` to `wrangler.jsonc` or set
`CLOUDFLARE_ACCOUNT_ID`.

For a custom domain, add the route/custom-domain configuration to `wrangler.jsonc`. Use that same
origin as `--warm-cdn-target`; cache identity is hostname-specific.

## Build and rehearse

```sh
npm run build
npm run start

# Stage and certify without shifting traffic. Add the real custom-domain target if applicable.
npm run deploy:stage -- --warm-cdn-target https://your-test-domain.example
```

Inspect the warm plan, skipped routes, failures, build IDs, and certification results. When it is
correct, deploy and promote:

```sh
npm run deploy -- --warm-cdn-target https://your-test-domain.example
```

## Workers Cache comparison deployment

The default variant uses Response Store at `prewarm.hichaelmart.com`. Setting
`VINEXT_CACHE_VARIANT=cdn` selects `cdnAdapter()`, `wrangler.cdn.jsonc`, Worker
`vinext-prewarm-cdn`, hostname `prewarm-cdn.hichaelmart.com`, and isolated output in `dist/cdn/`.

The Workers Cache Worker must also exist before its first prewarmed deployment:

```sh
npm run deploy:cdn:no-warm
npm run probe -- https://prewarm-cdn.hichaelmart.com

npm run deploy:cdn -- --warm-cdn-target https://prewarm-cdn.hichaelmart.com
npm run probe -- https://prewarm-cdn.hichaelmart.com
```

Use `deploy:cdn:no-warm` and `deploy:cdn` for the C/D comparison without changing adapters,
Worker names, or hostnames between runs.

## Probe a deployment

```sh
npm run probe -- https://your-test-domain.example
```

Each JSON line records first/second latency, `CF-Cache-Status`, `X-Vinext-Cache`, build identity,
and colo. Run it from multiple regions and retain the output for comparison.

## Revalidation checks

```sh
curl -sS -X POST https://your-test-domain.example/api/revalidate-tag \
  -H 'content-type: application/json' -d '{"tag":"post:featured"}'

curl -sS -X POST https://your-test-domain.example/api/revalidate-path \
  -H 'content-type: application/json' -d '{"path":"/cached/intro"}'
```

Check the old render ID, first response after invalidation, replacement render ID, latency, and
cache headers. This currently exercises Response Store invalidation; future public CacheW soft
purge should be tested separately.

## Version A/B test

1. Deploy version A and record `/api/version` plus page render IDs.
2. Make a visible source change and deploy version B with `npm run deploy:stage`.
3. Verify warming and certification before promotion.
4. Promote B and probe from multiple regions.
5. Fail the run if any response reports A's build ID after B has stabilized.

For a Vercel comparison, deploy the same route/data behavior as native Next.js and compare commit
to first-user-ready time, cold/warm TTFB, cache status, stale behavior, and render IDs. Keep the
Cloudflare no-warm control as a third arm so platform differences are not mistaken for prewarming
benefit.
