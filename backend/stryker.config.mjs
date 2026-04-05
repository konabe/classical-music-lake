/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: "vitest",
  mutate: ["src/**/*.ts", "!src/**/*.test.ts", "!src/test/**"],
  vitest: {
    configFile: "vitest.config.mts",
  },
  reporters: ["html", "clear-text", "progress", "dashboard"],
  htmlReporter: {
    fileName: "reports/mutation/mutation-report.html",
  },
  dashboard: {
    module: "backend",
    reportType: "full",
  },
  coverageAnalysis: "perTest",
  tempDirName: ".stryker-tmp",
};
