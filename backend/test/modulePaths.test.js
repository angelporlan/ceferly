import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("Sequelize index imports User.js with Linux-sensitive casing", () => {
    const source = readFileSync(path.join(root, "src/models/index.js"), "utf8");
    assert.match(source, /from ["']\.\/User\.js["']/);
    assert.equal(source.includes("./user.js"), false);
});
