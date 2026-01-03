import { $ } from "bun";
import { join } from "path";

interface CleanHTMLResult {
  originalSize: number;
  cleanedSize: number;
  reductionPercent: number;
  cleanedHtml: string;
}

interface CleanHTMLError {
  error: string;
}

/**
 * Cleans massive HTML (5MB+) for LLM context using Python's HtmlRAG
 * Reduces by ~94% without requiring GPU or embeddings
 */
export async function cleanHTMLForLLM(html: string): Promise<CleanHTMLResult> {
  const pythonDir = join(import.meta.dir, "../../python");

  try {
    console.log(`Cleaning HTML (${(html.length / 1024).toFixed(2)} KB)...`);

    // Execute Python script with Poetry
    const proc = Bun.spawn({
      cmd: ["poetry", "run", "python", "-m", "html_cleaner.cleaner"],
      cwd: pythonDir,
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });

    // Write HTML to stdin
    proc.stdin.write(html);
    proc.stdin.end();

    // Read result
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();

    await proc.exited;

    // Debug: mostrar lo que recibimos
    if (proc.exitCode !== 0) {
      console.error("Python stderr:", stderr);
      throw new Error(`Python script exited with code ${proc.exitCode}`);
    }

    // Debug: mostrar stdout antes de parsear
    console.log("Python stdout (first 500 chars):", stdout.substring(0, 500));

    if (!stdout || stdout.trim() === '') {
      throw new Error("Python script returned empty output");
    }

    let result: CleanHTMLResult;
    try {
      result = JSON.parse(stdout) as CleanHTMLResult;
    } catch (parseError) {
      console.error("Failed to parse JSON. Raw output:", stdout);
      throw new Error(`Invalid JSON response from Python: ${parseError}`);
    }

    // Validar estructura
    if (!result || typeof result.cleanedHtml === 'undefined') {
      console.error("Invalid result structure:", result);
      throw new Error("Python script returned invalid data structure");
    }

    console.log(`✓ Cleaned: ${(result.cleanedSize / 1024).toFixed(2)} KB (${result.reductionPercent.toFixed(1)}% reduction)`);

    return result;

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to clean HTML: ${error.message}`);
    }
    throw new Error("Failed to clean HTML: Unknown error");
  }
}
