#!/usr/bin/env tzx
import { $ } from "zx";

await $`echo "Execute"`;

for (let i = 0; i < 10; i++) {
  await $`sleep 1`;
}

await $`echo "Done"`;
