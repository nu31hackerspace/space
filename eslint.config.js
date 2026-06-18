import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import vuePrettier from '@vue/eslint-config-prettier'

// ESLint 9 flat config — migrated from the legacy `.eslintrc.js`.
//
// `createConfigForNuxt()` provides the Nuxt base: the Vue 3 recommended ruleset,
// TypeScript support, browser/node globals, ESLint's `recommended` JS rules, and
// global ignores (it also reads `.gitignore`). With the default `stylistic: false`
// it does not enforce ESLint style rules — formatting is left to Prettier.
//
// Formatting is owned entirely by Prettier (`.prettierrc`, run via `npm run format`).
// `@vue/eslint-config-prettier` turns off any ESLint rules that would conflict with
// Prettier and surfaces formatting drift as `prettier/prettier` warnings, keeping
// `npm run lint` errors focused on real code issues rather than style.
export default createConfigForNuxt().append(vuePrettier)
