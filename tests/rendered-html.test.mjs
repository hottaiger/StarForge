import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("服务端渲染成品索引页面", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>STAR\/\/INDEX<\/title>/i);
  assert.match(html, /GitHub Star/);
  assert.match(html, /分类索引/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("分类数据包含完整的 69 个仓库", async () => {
  const raw = await readFile(new URL("../public/data/classified-stars.json", import.meta.url), "utf8");
  const items = JSON.parse(raw);
  assert.equal(items.length, 69);
  assert.ok(items.every((item) => item.full_name && item.category && item.html_url));
});
