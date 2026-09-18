import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { cdnAdapter } from "@vinext/cloudflare/cache/cdn-adapter";
import { responseStoreAdapter } from "@vinext/cloudflare/cache/response-store-adapter";

const cacheVariant = process.env.VINEXT_CACHE_VARIANT ?? "response-store";
if (cacheVariant !== "response-store" && cacheVariant !== "cdn") {
  throw new Error(`Unknown VINEXT_CACHE_VARIANT: ${cacheVariant}`);
}

const isCdn = cacheVariant === "cdn";
const outputRoot = isCdn ? "dist/cdn" : "dist";
const responseStore = responseStoreAdapter({ mode: "self-contained" });
const workersCache = cdnAdapter();

export default defineConfig({
  plugins: [
    vinext({
      cache: isCdn ? { cdn: workersCache } : responseStore,
      clientOutDir: `${outputRoot}/client`,
      rscOutDir: `${outputRoot}/server`,
      ssrOutDir: `${outputRoot}/server/ssr`,
      prerender: { routes: "*" },
    }),
    cloudflare({
      configPath: isCdn ? "./wrangler.cdn.jsonc" : "./wrangler.jsonc",
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
    {
      name: "vinext-prewarm:isolated-client-output",
      config() {
        return {
          environments: {
            client: { build: { outDir: `${outputRoot}/client` } },
          },
        };
      },
    },
  ],
});
