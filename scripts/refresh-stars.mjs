import { execFileSync } from "node:child_process";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CATEGORY_RULES = [
  ["AI 编码工作流", ["codex", "claude-code", "cursor", "agent-skill", "copilot"], 0.9],
  ["AI Agent 生态", ["agent", "multi-agent", "mcp", "orchestration", "openai"], 0.8],
  ["LLM 工程", ["llm", "rag", "prompt", "embedding", "gpt", "model"], 0.8],
  ["前端与 Taro", ["react", "vue", "taro", "frontend", "nextjs", "typescript"], 0.75],
  ["设计工程", ["design", "figma", "css", "html", "ui", "ux"], 0.75],
  ["开发者工具", ["cli", "devtools", "debug", "git", "tooling"], 0.7],
];

function searchableText(repository) {
  return [repository.full_name, repository.description, repository.language, ...(repository.topics ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function classifyStars(pages, now = new Date()) {
  const repositories = pages.flat();

  return repositories.map((repository) => {
    const text = searchableText(repository);
    const rule = CATEGORY_RULES.find(([, keywords]) => keywords.some((keyword) => text.includes(keyword)));
    const [category, keywords, confidence] = rule ?? ["归档", [], 0.35];
    const matchedKeywords = keywords.filter((keyword) => text.includes(keyword));
    const recentlyPushed = repository.pushed_at && now.getTime() - new Date(repository.pushed_at).getTime() <= 30 * 24 * 60 * 60 * 1000;
    const interestScore = Math.min(100, Math.round(Math.log10((repository.stargazers_count ?? 0) + 1) * 20 + (recentlyPushed ? 4 : 0)));

    return {
      full_name: repository.full_name,
      html_url: repository.html_url,
      description: repository.description,
      language: repository.language,
      topics: repository.topics ?? [],
      stargazers_count: repository.stargazers_count ?? 0,
      forks_count: repository.forks_count ?? 0,
      open_issues_count: repository.open_issues_count ?? 0,
      archived: repository.archived ?? false,
      pushed_at: repository.pushed_at,
      updated_at: repository.updated_at,
      category,
      confidence,
      interest_score: interestScore,
      reason: matchedKeywords.length ? `命中关键词：${matchedKeywords.join("、")}` : "没有明显分类信号，放入 归档。",
      source: "rules",
    };
  });
}

async function refreshStars() {
  const raw = execFileSync("gh", ["api", "user/starred", "--paginate", "--slurp", "-X", "GET", "-f", "per_page=100"], {
    encoding: "utf8",
    stdio: ["inherit", "pipe", "inherit"],
  });
  const destination = resolve(dirname(fileURLToPath(import.meta.url)), "../public/data/classified-stars.json");
  const temporary = `${destination}.tmp`;

  await mkdir(dirname(destination), { recursive: true });
  await writeFile(temporary, `${JSON.stringify(classifyStars(JSON.parse(raw)), null, 2)}\n`);
  await rename(temporary, destination);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  refreshStars().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
