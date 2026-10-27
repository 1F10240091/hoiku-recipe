const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
function client(status, body) {
  const storage = new Map([["token", "test-token"]]);
  const exports = {};
  const context = { exports, require: () => ({ demoApi: {} }), process: { env: {} }, FormData,
    localStorage: { getItem: (key) => storage.get(key), removeItem: (key) => storage.delete(key) },
    fetch: async () => ({ ok: status >= 200 && status < 300, status, text: async () => body,
      json: async () => { if (!body) throw new SyntaxError("Empty JSON"); return JSON.parse(body); } }),
  };
  const code = ts.transpileModule(readFileSync(path.join(__dirname, "../src/lib/api.ts"), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, context);
  return { api: exports.api, storage };
}
test("204 deletes complete without parsing an empty response", async () => {
  const { api } = client(204, "");
  assert.equal(await api.deleteInventory("item"), undefined);
  assert.equal(await api.deleteChild("child"), undefined);
  assert.equal(await api.deleteRecipe("recipe"), undefined);
});
test("expired authentication clears the stored token", async () => {
  const { api, storage } = client(401, '{"detail":"ログインしてください"}');
  await assert.rejects(api.me(), /ログインしてください/);
  assert.equal(storage.has("token"), false);
});
test("proxy HTML errors display a useful message", async () => {
  const { api } = client(502, "<html>proxy failure</html>");
  await assert.rejects(api.me(), /502/);
});
