require("dotenv").config();
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5-coder:32b";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

async function checkOllama() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!res.ok) throw new Error();
    console.log("✓ Ollama available — model :", OLLAMA_MODEL);
    return true;
  } catch {
    console.log("⚠️  Ollama unavailable — run : brew services start ollama");
    return false;
  }
}

function getChangedFiles() {
  const output = execSync("git diff HEAD~1 --name-only --diff-filter=AM")
    .toString()
    .trim();
  return output
    .split("\n")
    .filter(
      (f) =>
        f.match(/\.(ts|tsx|js|jsx)$/) &&
        !f.includes(".test.") &&
        !f.includes(".spec.") &&
        !f.includes("__tests__") &&
        !f.includes("_layout")
    );
}

async function generateUnitTests(filePath, code) {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      options: { temperature: 0.2 },
      prompt: `You are a React Native testing expert. Write Jest unit tests for this file.

Rules:
- Use @testing-library/react-native
- Add jest.mock('@react-native-async-storage/async-storage') if AsyncStorage is used
- Add jest.mock('expo-router') if expo-router is used
- Return ONLY the TypeScript test file content, no explanation, no markdown, no backticks

File: ${filePath}
Code:
${code}

Return only the .test.ts file content:`,
    }),
  });

  const data = await response.json();
  return data.response?.trim() ?? null;
}

async function generateE2ETests(filePath, code) {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      options: { temperature: 0.2 },
      prompt: `You are a Playwright testing expert for React Native Web. Write Playwright e2e tests for this screen.

Rules:
- Use @playwright/test
- Use getByRole, getByText, getByTestId selectors
- Add beforeEach with navigation to the screen
- Return ONLY the TypeScript spec file content, no explanation, no markdown, no backticks

File: ${filePath}
Code:
${code}

Return only the .spec.ts file content:`,
    }),
  });

  const data = await response.json();
  return data.response?.trim() ?? null;
}

function cleanResponse(text) {
  return text
    .replace(/^```(typescript|ts|javascript|js|yaml)?\n?/m, "")
    .replace(/```$/m, "")
    .trim();
}

function writeFile(filePath, content) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content, "utf-8");

  if (fs.existsSync(absolutePath)) {
    console.log("✓ Generated :", absolutePath);
    return true;
  } else {
    console.error("✗ Writing failed :", absolutePath);
    return false;
  }
}

async function main() {
  const ollamaOk = await checkOllama();
  if (!ollamaOk) process.exit(0);

  const fileArg = process.argv.find((a) => a.startsWith("--file="));
  const changedFiles = fileArg
    ? [fileArg.replace("--file=", "")]
    : getChangedFiles();

  if (changedFiles.length === 0) {
    console.log("Not source file changed.");
    return;
  }

  console.log("Detected file :", changedFiles);

  for (const file of changedFiles) {
    if (!fs.existsSync(file)) {
      console.warn("⚠️ File not found :", file);
      continue;
    }

    const code = fs.readFileSync(file, "utf-8");
    const dir = path.dirname(file);
    const base = path.basename(file, path.extname(file));
    const isScreen = false; // TODO: activer pour e2e Maestro

    console.log(`\n→ Generation of unit tests for : ${file}`);
    const unitContent = await generateUnitTests(file, code);
    if (unitContent) {
      const testPath = path.join(dir, "__tests__", `${base}.test.ts`);
      writeFile(testPath, cleanResponse(unitContent));
    }

    if (isScreen) {
      console.log(`→ Génération tests e2e pour : ${file}`);
      const e2eContent = await generateE2ETests(file, code);
      if (e2eContent) {
        const e2ePath = path.join("e2e", dir, `${base}.spec.ts`);
        writeFile(e2ePath, cleanResponse(e2eContent));
      }
    }

    if (changedFiles.length > 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log("\n✅ Generation end — read changes before committing tests.");
  console.log("   git add . && git commit -m 'tests: ...'");
}

main().catch(console.error);