import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "test");
const files = readdirSync(testDir)
    .filter((name) => name.endsWith(".test.js"))
    .sort()
    .map((name) => path.join(testDir, name));

if (files.length === 0) {
    console.error(`No *.test.js files found in ${testDir}`);
    process.exit(1);
}

const result = spawnSync(process.execPath, ["--test", ...files], {
    stdio: "inherit"
});

process.exit(result.status === null ? 1 : result.status);
