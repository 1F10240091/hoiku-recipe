const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const catalog = require("../../backend/app/data/allergens.json");
function compile(file, imports) {
  const exports = {};
  const source = ts.transpileModule(readFileSync(path.join(__dirname, file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, { exports, require: (name) => name in imports ? imports[name] : require(name) });
  return exports;
}
const helpers = compile("../src/lib/allergens.ts", { "../../../backend/app/data/allergens.json": catalog });
const Picker = compile("../src/components/AllergenPicker.tsx", { "@/lib/allergens": helpers }).default;
function markup(allergies = [], disabled = false) {
  return renderToStaticMarkup(React.createElement(Picker, { child: { id: "child", name: "test", allergies }, disabled, onToggle: () => {} }));
}
test("all 29 options are available in initially collapsed groups with none selected", () => {
  const html = markup();
  assert.equal((html.match(/<button /g) || []).length, 29);
  assert.equal((html.match(/aria-pressed="false"/g) || []).length, 29);
  assert.match(html, /表示義務の対象（9品目）/);
  assert.match(html, /表示推奨の対象（20品目）/);
  assert.match(html, /ピスタチオ/);
  assert.equal((html.match(/<details /g) || []).length, 2);
  assert.equal((html.match(/<summary /g) || []).length, 2);
  assert.doesNotMatch(html, /<details[^>]*\sopen(?:[\s=>])/);
});
test("existing milk alias appears as one selected standard choice", () => {
  const html = markup([{ id: "old", ingredient: "牛乳" }]);
  assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1);
  assert.match(html, /aria-label="乳を解除"/);
  assert.equal(helpers.canonicalAllergen("ピーナッツ"), "落花生");
  assert.equal(helpers.canonicalAllergen("えび"), "えび");
  assert.equal(helpers.canonicalAllergen("その他の食材"), "その他の食材");
});
test("saving disables all 29 choices to prevent repeated writes", () => {
  assert.equal((markup([], true).match(/disabled=""/g) || []).length, 29);
});
