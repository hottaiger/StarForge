import assert from "node:assert/strict";
import test from "node:test";
import { classifyStars } from "../scripts/refresh-stars.mjs";

test("将 GitHub starred 分页响应转换为页面分类数据", () => {
  const items = classifyStars([
    [
      {
        full_name: "octo/codex-helper",
        html_url: "https://github.com/octo/codex-helper",
        description: "A Codex workflow helper",
        language: "TypeScript",
        topics: ["codex", "agent-skill"],
        stargazers_count: 120,
        forks_count: 12,
        open_issues_count: 3,
        archived: false,
        pushed_at: "2026-07-10T00:00:00Z",
        updated_at: "2026-07-10T00:00:00Z",
      },
    ],
  ], new Date("2026-07-10T12:00:00Z"));

  assert.equal(items.length, 1);
  assert.deepEqual(items[0], {
    full_name: "octo/codex-helper",
    html_url: "https://github.com/octo/codex-helper",
    description: "A Codex workflow helper",
    language: "TypeScript",
    topics: ["codex", "agent-skill"],
    stargazers_count: 120,
    forks_count: 12,
    open_issues_count: 3,
    archived: false,
    pushed_at: "2026-07-10T00:00:00Z",
    updated_at: "2026-07-10T00:00:00Z",
    category: "AI 编码工作流",
    confidence: 0.9,
    interest_score: 46,
    reason: "命中关键词：codex、agent-skill",
    source: "rules",
  });
});
