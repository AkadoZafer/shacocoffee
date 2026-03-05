// eslint.config.js
// Vercel build'de "Treat warnings as errors" açıksa bu config kritik.
// no-unused-vars gibi kurallar "warn" olarak bırakılır, build patlamaz.

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist", "node_modules"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // ✅ Build'i patlatmayan, sadece uyaran kurallar
      "no-unused-vars": ["warn", {
        varsIgnorePattern: "^_",      // _prefix ile başlayanlar görmezden gelinir
        argsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],

      // React Refresh — sadece uyar, hata verme
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // Gereksiz console.log uyarısı (isteğe bağlı, kaldırabilirsin)
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];
