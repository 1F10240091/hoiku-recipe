import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
export default defineConfig([
  ...nextVitals, ...nextTs,
  { rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "react-hooks/set-state-in-effect": "off",
    "react-hooks/purity": "off",
  } },
  globalIgnores([".next/**", ".next-*/**", "next-env.d.ts"]),
]);
