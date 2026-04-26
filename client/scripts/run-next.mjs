import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

function sanitizeNodeOptions(value) {
  if (!value) return "";

  const parts = value.split(/\s+/).filter(Boolean);
  const kept = [];

  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];

    if (part === "--localstorage-file") {
      if (i + 1 < parts.length && !parts[i + 1].startsWith("--")) {
        i += 1;
      }
      continue;
    }

    if (part.startsWith("--localstorage-file=")) {
      continue;
    }

    kept.push(part);
  }

  return kept.join(" ");
}

const env = { ...process.env };
const sanitizedNodeOptions = sanitizeNodeOptions(env.NODE_OPTIONS);

if (sanitizedNodeOptions) {
  env.NODE_OPTIONS = sanitizedNodeOptions;
} else {
  delete env.NODE_OPTIONS;
}

const child = spawn(process.execPath, [nextBin, ...process.argv.slice(2)], {
  stdio: "inherit",
  env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
