#!/usr/bin/env tzx
import { $ } from "zx";

await $`echo "Execute"`;

throw new Error("Something went wrong")

await $`echo "Done"`;
