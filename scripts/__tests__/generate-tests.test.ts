import { execSync } from "child_process";
import fs from "fs";
import path from "path";

jest.mock("child_process");
jest.mock("fs");

describe("generate-tests", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("checkOllama", () => {
    it("should return true if Ollama is available", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn(),
      });

      const result = await require("./scripts/generate-tests").checkOllama();
      expect(result).toBe(true);
    });

    it("should return false if Ollama is unavailable", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error());

      const result = await require("./scripts/generate-tests").checkOllama();
      expect(result).toBe(false);
    });
  });

  describe("getChangedFiles", () => {
    it("should return a list of changed files", () => {
      execSync.mockReturnValue(
        "src/App.tsx\nsrc/components/Button.tsx\nREADME.md"
      );

      const result = require("./scripts/generate-tests").getChangedFiles();
      expect(result).toEqual(["src/App.tsx", "src/components/Button.tsx"]);
    });
  });

  describe("generateUnitTests", () => {
    it("should generate unit tests for a given file and code", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockReturnValue({ response: "test content" }),
      });

      const result = await require("./scripts/generate-tests").generateUnitTests(
        "src/App.tsx",
        "const App = () => <div>Hello World</div>;"
      );
      expect(result).toBe("test content");
    });
  });

  describe("generateE2ETests", () => {
    it("should generate e2e tests for a given file and code", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockReturnValue({ response: "test content" }),
      });

      const result = await require("./scripts/generate-tests").generateE2ETests(
        "src/App.tsx",
        "const App = () => <div>Hello World</div>;"
      );
      expect(result).toBe("test content");
    });
  });

  describe("cleanResponse", () => {
    it("should clean the response by removing code block markers", () => {
      const result = require("./scripts/generate-tests").cleanResponse(
        "```typescript\ntest content\n```"
      );
      expect(result).toBe("test content");
    });
  });

  describe("writeFile", () => {
    it("should write the file to the specified path", () => {
      fs.mkdirSync = jest.fn();
      fs.writeFileSync = jest.fn();

      const result = require("./scripts/generate-tests").writeFile(
        "src/App.test.ts",
        "test content"
      );
      expect(result).toBe(true);
    });

    it("should return false if writing fails", () => {
      fs.mkdirSync = jest.fn();
      fs.writeFileSync = jest.fn().mockImplementation(() => {
        throw new Error();
      });

      const result = require("./scripts/generate-tests").writeFile(
        "src/App.test.ts",
        "test content"
      );
      expect(result).toBe(false);
    });
  });
});