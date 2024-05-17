const js = require("@eslint/js")
const prettier = require("eslint-config-prettier/prettier")
const globals = require("globals")

module.exports = [
  {
    languageOptions: {
      ecmaVersion: "latest",

      globals: {
        ...globals.node,
        ...globals.commonjs,
        ...globals.es2021,
        ...globals.jest,
      },
      sourceType: "commonjs",
    },
    rules: {},
  },
  js.configs.recommended,
  prettier,
]
