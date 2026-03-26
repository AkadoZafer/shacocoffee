// eslint.config.js
// Vercel build'de "Treat warnings as errors" açıksa bu config kritik.
// no-unused-vars gibi kurallar "warn" olarak bırakılır, build patlamaz.

import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    ignores: [
      "dist",
      "node_modules",
      "src/pages/_backup/**",
      "src/components/_backup_*.jsx",
      "src_backup_pre_v2/**",
      "src_backup_before_polish_v2/**",
      "src_backup_*/**",
      "android/**",
    ],
  },
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
      react,
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
      "react/jsx-uses-vars": "warn",

      // React Refresh — sadece uyar, hata verme
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // Gereksiz console.log uyarısı (isteğe bağlı, kaldırabilirsin)
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["src/context/**/*.jsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
];
