import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

const certPath = process.env.SIX_SEEEVEN_DEV_CERT;
const keyPath = process.env.SIX_SEEEVEN_DEV_KEY;

export default defineConfig({
  plugins: [react(), ...(certPath && keyPath ? [] : [basicSsl()])],
  server:
    certPath && keyPath
      ? { https: { cert: readFileSync(certPath), key: readFileSync(keyPath) } }
      : undefined,
  test: { environment: "jsdom", setupFiles: "./src/test/setup.ts", css: false },
});
