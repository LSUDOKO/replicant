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
    ".0g-skills/**",
    "0g-agent-nft/**",
    "out/**",
    "cache_forge/**",
    "lib/openzeppelin-contracts/**",
    ".0g-skills/**",
    "0g-agent-nft/**",
  ]),
]);

export default eslintConfig;
