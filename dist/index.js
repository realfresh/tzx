#!/usr/bin/env node

// src/index.ts
import os from "node:os";
import child from "node:child_process";
import process from "node:process";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import esbuild from "esbuild";
var proc;
var tmpFilePath;
var id = crypto.randomBytes(6).toString("hex");
var out = path.resolve(process.cwd(), `.tzx-${id}.mjs`);
function clean() {
  try {
    fs.rmSync(out);
  } catch {
  }
  try {
    if (tmpFilePath)
      fs.rmSync(tmpFilePath);
  } catch {
  }
  try {
    if (proc)
      proc.kill();
  } catch {
  }
}
function exit(exitCode, err) {
  clean();
  if (err)
    console.error(err);
  process.exit(exitCode);
}
async function bundle(inputFilePath) {
  const ext = path.extname(inputFilePath);
  if (!ext) {
    tmpFilePath = path.resolve(os.tmpdir(), `${id}.ts`);
    fs.copyFileSync(inputFilePath, tmpFilePath);
  }
  const loader = ext ? { [ext]: "ts" } : {};
  const plugins = [
    {
      name: "make-all-packages-external",
      setup(build) {
        const filter = /^[^./]|^\.[^./]|^\.\.[^/]/;
        build.onResolve({ filter }, ({ path: path2 }) => {
          return { path: path2, external: true };
        });
      }
    }
  ];
  const result = await esbuild.build({
    entryPoints: [tmpFilePath || inputFilePath],
    write: false,
    bundle: true,
    platform: "node",
    target: "node16",
    format: "esm",
    minify: false,
    external: [],
    sourcemap: true,
    loader,
    plugins
  });
  return result.outputFiles[0].text;
}
process.on("SIGINT", clean);
process.on("SIGTERM", clean);
try {
  let input = process.argv[2];
  if (!input) {
    console.error("\n[Error]");
    console.error(`No file specified`);
    process.exit(1);
  }
  const script = await bundle(input);
  const scriptClean = script.replace(/^import.*("|')zx(";|';|"|')/gm, "");
  fs.writeFileSync(out, scriptClean);
  proc = child.spawn("zx", [out], {
    stdio: "inherit",
    env: { ...process.env }
  });
  proc.on("exit", async (exitCode, signalCode) => {
    if (exitCode === 0) {
      exit(exitCode);
    } else {
      exit(
        exitCode || 1,
        `Non-zero exit: code ${exitCode}, signal ${signalCode}`
      );
    }
  });
  proc.on("error", (err) => exit(1, err));
} catch (e) {
  exit(1, e);
}
//# sourceMappingURL=index.js.map