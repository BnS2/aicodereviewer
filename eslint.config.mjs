import tailwindV4 from "@bns2/eslint-plugin-tailwind-v4";
import js from "@eslint/js";
import { tanstackConfig } from "@tanstack/eslint-config";
import { defineConfig, globalIgnores } from "eslint/config";
import biome from "eslint-config-biome";
import tailwindCanonicalClasses from "eslint-plugin-tailwind-canonical-classes";

export default defineConfig([
  globalIgnores([
    ".output/**",
    ".tanstack/**",
    ".vinxi/**",
    "node_modules/**",
    "dist/**",
    "src/generated/**",
    "**/*.gen.ts",
    "src/components/ui/**",
    "env.d.ts",
  ]),

  js.configs.recommended,
  ...tanstackConfig,
  biome,
  ...tailwindCanonicalClasses.configs["flat/recommended"],
  tailwindV4.configs.recommended("./src/app/globals.css"),
  {
    rules: {
      "sort-imports": "off",
      "tailwind-v4/typo": ["error", { cssPath: "./src/app/globals.css" }],
      "tailwind-canonical-classes/tailwind-canonical-classes": [
        "warn",
        {
          cssPath: "./src/app/globals.css",
        },
      ],
    },
  },
]);
