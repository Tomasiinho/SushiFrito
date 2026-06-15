import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.expo/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "apps/mobile/.expo/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.ts",
      "eslint.config.mjs",
      "prettier.config.mjs",
      "scripts/*.mjs",
      "vitest.workspace.ts"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        { "allowExpressions": true }
      ],
      "@typescript-eslint/no-floating-promises": "error"
    }
  }
);
