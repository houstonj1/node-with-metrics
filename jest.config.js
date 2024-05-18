/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  extensionsToTreatAsEsm: [".ts"],
  modulePathIgnorePatterns: ["dist"],
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "\\.[jt]s?$": ["ts-jest", { useESM: true }],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.[jt]s$": "$1",
  },
}
