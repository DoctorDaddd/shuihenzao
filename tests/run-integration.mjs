import { spawn, execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const port = 5174;
const origin = `http://127.0.0.1:${port}`;
try {
  await fetch(origin, { signal: AbortSignal.timeout(1000) });
  throw new Error(
    `Port ${port} is already in use. Stop the existing local test server first.`,
  );
} catch (error) {
  if (error.message.includes("already in use")) throw error;
}
const storage = `.wrangler/test-${randomUUID()}`;
mkdirSync(storage, { recursive: true });
const testEnvFile = resolve(storage, ".env");
writeFileSync(testEnvFile, "QUEST_ADMIN_PASSWORD=isolated-test-password-ONLY-2026\n");
const wrangler = [
  "--import",
  "./scripts/sites-env.mjs",
  "./node_modules/wrangler/bin/wrangler.js",
];
for (const migration of readdirSync("drizzle").filter(name => name.endsWith(".sql")).sort()) execFileSync(
  process.execPath,
  [
    ...wrangler,
    "d1",
    "execute",
    "DB",
    "--local",
    "--config",
    "dist/server/wrangler.json",
    "--persist-to",
    storage,
    "--file",
    "drizzle/" + migration,
  ],
  { stdio: "pipe", windowsHide: true },
);
const server = spawn(
  process.execPath,
  [
    ...wrangler,
    "dev",
    "--config",
    "dist/server/wrangler.json",
    "--local",
    "--persist-to",
    storage,
    "--ip",
    "127.0.0.1",
    "--port",
    String(port),
    "--inspector-port",
    "0",
    "--log-level",
    "error",
    "--env-file",
    testEnvFile,
  ],
  { stdio: ["ignore", "pipe", "pipe"], windowsHide: true },
);
let output = "";
server.stdout.on("data", (value) => {
  output += value;
});
server.stderr.on("data", (value) => {
  output += value;
});
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const result = await fetch(origin + "/api/quest/state", {
        signal: AbortSignal.timeout(500),
      });
      ready = result.ok;
    } catch {
      /* Server startup may not yet have opened its socket. */
    }
    if (ready) break;
    if (server.exitCode !== null) throw new Error(output);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!ready)
    throw new Error("Local test server failed to become ready.\n" + output);
  const testProcess = spawn(process.execPath, ["tests/api.integration.mjs"], {
    stdio: "inherit",
    windowsHide: true,
    env: { ...process.env, QUEST_TEST_ORIGIN: origin },
  });
  const result = await new Promise((resolve, reject) => {
    testProcess.on("error", reject);
    testProcess.on("exit", resolve);
  });
  if (result !== 0) throw new Error("Integration suite failed.\n" + output);
} finally {
  server.kill();
  console.log(
    `Isolated test records retained at ${storage}; production and preview records are untouched.`,
  );
}
