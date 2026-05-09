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
    process.env.OLLAMA_MODEL = "qwen2.5-coder:32b";
    process.env.OLLAMA_URL = "http://localhost:11434";
    process.env.BRANCH_NAME = "main";

    (execSync as jest.Mock).mockImplementation((command) => {
      if (command.includes("git diff")) {
        return Buffer.from("src/App.tsx\nsrc/components/Button.tsx");
      }
      return Buffer.from("");
    });

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(
      "const App = () => <div>Hello World</div>;"
    );
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should generate unit tests for changed files", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ response: "test content" }),
    });
    global.fetch = fetchMock as any;

    await require("./scripts/generate-tests").main();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:11434/api/generate",
      expect.any(Object)
    );

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join("src", "__tests__", "App.test.ts"),
      "test content"
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join("src/components", "__tests__", "Button.test.ts"),
      "test content"
    );
  });

  it("should not generate tests if no files are changed", async () => {
    (execSync as jest.Mock).mockImplementation((command) => {
      if (command.includes("git diff")) {
        return Buffer.from("");
      }
      return Buffer.from("");
    });

    await require("./scripts/generate-tests").main();

    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it("should handle file argument", async () => {
    process.argv.push("--file=src/App.tsx");

    const fetchMock = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ response: "test content" }),
    });
    global.fetch = fetchMock as any;

    await require("./scripts/generate-tests").main();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:11434/api/generate",
      expect.any(Object)
    );

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join("src", "__tests__", "App.test.ts"),
      "test content"
    );
  });

  it("should not generate e2e tests for non-screen files", async () => {
    (execSync as jest.Mock).mockImplementation((command) => {
      if (command.includes("git diff")) {
        return Buffer.from("src/utils/helper.ts");
      }
      return Buffer.from("");
    });

    const fetchMock = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ response: "test content" }),
    });
    global.fetch = fetchMock as any;

    await require("./scripts/generate-tests").main();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:11434/api/generate",
      expect.any(Object)
    );

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join("src/utils", "__tests__", "helper.test.ts"),
      "test content"
    );
  });

  it("should generate e2e tests for screen files", async () => {
    (execSync as jest.Mock).mockImplementation((command) => {
      if (command.includes("git diff")) {
        return Buffer.from("src/screens/HomeScreen.tsx");
      }
      return Buffer.from("");
    });

    const fetchMock = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ response: "test content" }),
    });
    global.fetch = fetchMock as any;

    await require("./scripts/generate-tests").main();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:11434/api/generate",
      expect.any(Object)
    );

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join("src/screens", "__tests__", "HomeScreen.test.ts"),
      "test content"
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join("e2e/src/screens", "HomeScreen.spec.ts"),
      "test content"
    );
  });

  it("should handle Ollama not available", async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error());
    global.fetch = fetchMock as any;

    await require("./scripts/generate-tests").main();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:11434/api/tags",
      undefined
    );

    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});