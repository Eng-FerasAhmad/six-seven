import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const vocabularyPath = fileURLToPath(
  new URL("./src/content/englisch/vocabulary.json", import.meta.url),
);
function vocabularyEditor() {
  const middleware = async (
    req: import("node:http").IncomingMessage,
    res: import("node:http").ServerResponse,
    next: () => void,
  ) => {
    if (req.url !== "/api/vocabulary/edit" || req.method !== "POST")
      return next();
    try {
      let body = "";
      for await (const chunk of req) body += chunk;
      const { category, index, english, german } = JSON.parse(body);
      const groups = JSON.parse(await readFile(vocabularyPath, "utf8"));
      if (
        typeof category !== "string" ||
        !Number.isInteger(index) ||
        typeof english !== "string" ||
        typeof german !== "string" ||
        !english.trim() ||
        !german.trim()
      )
        throw new Error("Invalid vocabulary edit");
      const group = groups.find(
        (item: { english: string }) => item.english === category,
      );
      if (!group?.entries[index]) throw new Error("Word not found");
      group.entries[index] = { english: english.trim(), german: german.trim() };
      await writeFile(vocabularyPath, `${JSON.stringify(groups, null, 2)}\n`);
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ entries: group.entries }));
    } catch (error) {
      res.statusCode = 400;
      res.end(error instanceof Error ? error.message : "Could not save word");
    }
  };
  return {
    name: "vocabulary-editor",
    configureServer(server: import("vite").ViteDevServer) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server: import("vite").PreviewServer) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), vocabularyEditor()],
  test: { environment: "jsdom", setupFiles: "./src/test/setup.ts", css: false },
});
