import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vygenerovane subory (bundle Electronu, instalator, Prisma klient, fonty)
    "dist-electron/**",
    "release/**",
    "src/generated/**",
    "public/excalidraw-assets/**",
  ]),
]);

export default eslintConfig;
