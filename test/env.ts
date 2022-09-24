#!/usr/bin/env tzx
import { $ } from "zx";

await $`echo "Execute"`;

console.log(process.env)

await $`echo "Done"`;
