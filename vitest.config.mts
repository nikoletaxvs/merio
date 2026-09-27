import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url)).replace(/[\\/]$/, "");

export default defineConfig({
  resolve: {
    alias: [
      // Mirrors the `@/*` path in tsconfig.json.
      { find: /^@\/(.*)$/, replacement: `${root}/$1` },
      // `server-only` throws when imported outside a React Server Component
      // bundle. Tests run in plain Node, so swap it for an empty module.
      { find: "server-only", replacement: `${root}/test/server-only-stub.ts` },
    ],
  },
  test: {
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
  },
});
