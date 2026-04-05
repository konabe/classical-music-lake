/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: "vitest",
  mutate: ["app/**/*.ts", "app/**/*.vue", "!app/**/*.test.ts", "!app/**/*.stories.ts"],
  vitest: {
    configFile: "vitest.config.ts",
  },
  buildCommand: "npx nuxt prepare",
  reporters: ["html", "clear-text", "progress", "dashboard"],
  htmlReporter: {
    fileName: "reports/mutation/mutation-report.html",
  },
  dashboard: {
    module: "frontend",
    reportType: "full",
  },
  coverageAnalysis: "perTest",
  tempDirName: ".stryker-tmp",
};
