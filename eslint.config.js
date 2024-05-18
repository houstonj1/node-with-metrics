import globals from "globals"
import js from "@eslint/js"
import prettier from "eslint-config-prettier"
import teslint from "typescript-eslint"

export default [
  {
    languageOptions: {
      ecmaVersion: "latest",

      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: "module",
    },
    rules: {},
  },
  js.configs.recommended,
  prettier,
  ...teslint.configs.strict,
]
