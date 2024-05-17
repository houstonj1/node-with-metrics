import globals from "globals"
import js from "@eslint/js"
import prettier from "eslint-config-prettier"

export default [
  {
    languageOptions: {
      ecmaVersion: "latest",

      globals: {
        ...globals.node,
        ...globals.commonjs,
        ...globals.es2021,
        ...globals.jest,
      },
      sourceType: "module",
    },
    rules: {},
  },
  js.configs.recommended,
  prettier,
]
