import { execSync } from "child_process";
import fs from "fs";
import path from "path";

jest.mock("dotenv");
jest.mock("child_process");
jest.mock("fs");
jest.mock("path");

describe("generate-tests", () => {
  const mockEnv = {
    OLLAMA_MODEL: "qwen2.5-coder:32b",
    OLLAMA_URL: "http://localhost:11434",
    BRANCH_NAME: "main",
  };

  beforeEach(() => {
    process.env = { ...process.env, ...mockEnv };
    jest.clearAllMocks();
  });

  describe("checkOllama", () => {
    it("should return true if Ollama is available", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn(),
      });

      const result = await checkOllama();

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(`${mockEnv.OLLAMA_URL}/api/tags`);
    });

    it("should return false if Ollama is not available", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error());

      const result = await checkOllama();

      expect(result).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith(`${mockEnv.OLLAMA_URL}/api/tags`);
    });
  });

  describe("getChangedFiles", () => {
    it("should return a list of changed files", () => {
      execSync.mockReturnValue(
        "src/App.tsx\nsrc/components/Button.tsx\nREADME.md"
      );

      const result = getChangedFiles();

      expect(result).toEqual(["src/App.tsx", "src/components/Button.tsx"]);
    });
  });

  describe("generateUnitTests", () => {
    it("should generate unit tests for a given file and code", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockReturnValue({ response: "test content" }),
      });

      const result = await generateUnitTests("src/App.tsx", "code");

      expect(result).toBe("test content");
      expect(global.fetch).toHaveBeenCalledWith(`${mockEnv.OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: mockEnv.OLLAMA_MODEL,
          stream: false,
          options: { temperature: 0.2 },
          prompt:
            "You are a React Native testing expert. Write Jest unit tests for this file.\n\nRules:\n- Use @testing-library/react-native\n- Add jest.mock('@react-native-async-storage/async-storage') if AsyncStorage is used\n- Add jest.mock('expo-router') if expo-router is used\n- Return ONLY the TypeScript test file content, no explanation, no markdown, no backticks\n\nFile: src/App.tsx\nCode:\ncode\n\nReturn only the .test.ts file content:",
        }),
      });
    });

    it("should return null if fetch fails", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error());

      const result = await generateUnitTests("src/App.tsx", "code");

      expect(result).toBeNull();
    });
  });

  describe("generateE2ETests", () => {
    it("should generate e2e tests for a given file and code", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockReturnValue({ response: "test content" }),
      });

      const result = await generateE2ETests("src/App.tsx", "code");

      expect(result).toBe("test content");
      expect(global.fetch).toHaveBeenCalledWith(`${mockEnv.OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: mockEnv.OLLAMA_MODEL,
          stream: false,
          options: { temperature: 0.2 },
          prompt:
            "You are a Playwright testing expert for React Native Web. Write Playwright e2e tests for this screen.\n\nRules:\n- Use @playwright/test\n- Use getByRole, getByText, getByTestId selectors\n- Add beforeEach with navigation to the screen\n- Return ONLY the TypeScript spec file content, no explanation, no markdown, no backticks\n\nFile: src/App.tsx\nCode:\ncode\n\nReturn only the .spec.ts file content:",
        }),
      });
    });

    it("should return null if fetch fails", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error());

      const result = await generateE2ETests("src/App.tsx", "code");

      expect(result).toBeNull();
    });
  });

  describe("cleanResponse", () => {
    it("should remove markdown backticks", () => {
      const input = "```typescript\ntest content\n```";
      const result = cleanResponse(input);

      expect(result).toBe("test content");
    });

    it("should not modify text without markdown backticks", () => {
      const input = "test content";
      const result = cleanResponse(input);

      expect(result).toBe("test content");
    });
  });

  describe("writeFile", () => {
    it("should write file and create directory if necessary", () => {
      fs.mkdirSync.mockReturnValueOnce(undefined);
      fs.writeFileSync.mockReturnValueOnce(undefined);

      writeFile("src/__tests__/App.test.ts", "test content");

      expect(fs.mkdirSync).toHaveBeenCalledWith("src/__tests__", { recursive: true });
      expect(fs.writeFileSync).toHaveBeenCalledWith("src/__tests__/App.test.ts", "test content", "utf-8");
    });
  });

  describe("commitAndPush", () => {
    it("should commit and push generated files", () => {
      execSync.mockReturnValueOnce(undefined);

      commitAndPush(["src/__tests__/App.test.ts"]);

      expect(execSync).toHaveBeenCalledWith(`git config user.name "Qwen Test Bot"`);
      expect(execSync).toHaveBeenCalledWith(`git config user.email "bot@ollama.local"`);
      expect(execSync).toHaveBeenCalledWith(`git checkout -b tests/main-${Date.now()}`);
      expect(execSync).toHaveBeenCalledWith(`git add src/__tests__/App.test.ts`);
      expect(execSync).toHaveBeenCalledWith(`git commit -m "tests: generated by Qwen for main"`);
      expect(execSync).toHaveBeenCalledWith(`git push origin tests/main-${Date.now()}`);
    });
  });

  describe("main", () => {
    it("should generate and commit tests for changed files", async () => {
      execSync.mockReturnValueOnce(undefined);
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue("code");
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockReturnValue({ response: "test content" }),
      });

      await main();

      expect(execSync).toHaveBeenCalledWith(`git config user.name "Qwen Test Bot"`);
      expect(execSync).toHaveBeenCalledWith(`git config user.email "bot@ollama.local"`);
      expect(execSync).toHaveBeenCalledWith(`git checkout -b tests/main-${Date.now()}`);
      expect(fs.writeFileSync).toHaveBeenCalledWith("src/__tests__/App.test.ts", "test content", "utf-8");
      expect(execSync).toHaveBeenCalledWith(`git add src/__tests__/App.test.ts`);
      expect(execSync).toHaveBeenCalledWith(`git commit -m "tests: generated by Qwen for main"`);
      expect(execSync).toHaveBeenCalledWith(`git push origin tests/main-${Date.now()}`);
    });

    it("should not generate tests if no files are changed", async () => {
      execSync.mockReturnValueOnce(undefined);
      fs.existsSync.mockReturnValue(false);

      await main();

      expect(fs.writeFileSync).not.toHaveBeenCalled();
      expect(execSync).not.toHaveBeenCalledWith(`git add`);
      expect(execSync).not.toHaveBeenCalledWith(`git commit -m "tests: generated by Qwen for main"`);
      expect(execSync).not.toHaveBeenCalledWith(`git push origin tests/main-${Date.now()}`);
    });
  });
});