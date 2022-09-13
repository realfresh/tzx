#!/usr/bin/env node

// src/index.ts
import tsup from "tsup";
import crypto from "node:crypto";
import { $, path, fs, argv, chalk } from "zx";
var id = crypto.randomBytes(6).toString("hex");
var dir = path.resolve(process.cwd(), `.${id}`);
try {
  const input = argv._[0];
  if (!input) {
    console.log(chalk.red("\n[Error]"));
    console.log(`No file specified`);
    process.exit(1);
  }
  const output = path.resolve(dir, input.replace(".ts", ".js"));
  const outputPKG = path.resolve(dir, `package.json`);
  const outputTSConfig = path.resolve(dir, `tsconfig.json`);
  await $`rm -rf ${dir}`.quiet();
  await $`mkdir -p ${dir}`.quiet();
  await $`cp ${input} ${dir}/${input}`.quiet();
  await fs.writeJSON(outputPKG, {
    name: "__tmp_script__",
    version: "1.0.0",
    type: "module"
  });
  await fs.writeJSON(outputTSConfig, {});
  await tsup.build({
    config: false,
    entry: [`${dir}/${input}`],
    outDir: dir,
    format: "esm",
    target: "node16",
    platform: "node",
    skipNodeModulesBundle: true,
    splitting: false,
    silent: true,
    noExternal: [/.*/],
    outExtension: () => ({ js: ".js" })
  });
  const content = await fs.readFile(output, "utf8");
  const updated = content.replace(/^import.*("|')zx(";|';|"|')/gm, "");
  await fs.writeFile(output, updated);
  try {
    await $`zx ${output}`.stdio("inherit");
  } catch {
  }
  await $`rm -rf ${dir}`.quiet();
} catch (e) {
  await $`rm -rf ${dir}`.quiet();
  console.error(e);
  process.exit(1);
}
//# sourceMappingURL=index.js.map