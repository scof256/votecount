import nextJest from "next/jest.js";
import { pathsToModuleNameMapper } from "ts-jest";
import { readFileSync } from "fs";

const { compilerOptions } = JSON.parse(readFileSync("./tsconfig.json", "utf8"));

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/test/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
};

async function setup() {
  const config = await createJestConfig(customJestConfig)();
  config.transformIgnorePatterns = [
    "/node_modules/(?!superjson)/",
    "^.+\\.module\\.(css|sass|scss)$",
  ];
  return config;
}

export default setup;