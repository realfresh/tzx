#!/usr/bin/env tzx
import { $, argv } from "zx";

await $`echo "Execute"`;

console.log(argv);

await $`echo "Done"`;
