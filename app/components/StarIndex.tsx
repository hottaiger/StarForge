"use client";

import { useEffect, useMemo, useState } from "react";
import { RepoTable } from "./RepoTable";
import { filterAndSortStars, getCategoryCounts, getFeaturedStars, type SortMode, type StarRepository } from "../lib/stars";

const PIN_STORAGE_KEY = "star-index:pinned";

export function StarIndex() {
  const [stars, setStars] = useState<StarRepository[]>([]);
  const [category, setCategory] = useState("全部");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("interest");
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/data/classified-stars.json")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("data unavailable")))
      .then((data: StarRepository[]) => setStars(data))
      .catch(() => setError(true));
    try {
      setPinned(new Set(JSON.parse(window.localStorage.getItem(PIN_STORAGE_KEY) || "[]")));
    } catch {
      window.localStorage.removeItem(PIN_STORAGE_KEY);
    }
  }, []);

  const counts = useMemo(() => getCategoryCounts(stars), [stars]);
  const categories = useMemo(() => Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b)), [counts]);
  const visibleStars = useMemo(() => filterAndSortStars(stars, { category, query, sort, pinned }), [stars, category, query, sort, pinned]);
  const featured = useMemo(() => getFeaturedStars(stars), [stars]);
  const groups = useMemo(() => {
    const grouped = new Map<string, StarRepository[]>();
    visibleStars.forEach((item) => grouped.set(item.category, [...(grouped.get(item.category) || []), item]));
    return [...grouped.entries()].sort(([a], [b]) => (category === "全部" ? categories.indexOf(a) - categories.indexOf(b) : a.localeCompare(b)));
  }, [visibleStars, category, categories]);

  function togglePin(fullName: string) {
    setPinned((current) => {
      const next = new Set(current);
      next.has(fullName) ? next.delete(fullName) : next.add(fullName);
      window.localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="回到顶部">STAR<span>//</span>INDEX</a>
        <div className="system-status"><i /> LOCAL / RULES / READY</div>
      </header>

      <div id="top" className="intro">
        <p className="eyebrow">PERSONAL TECH SIGNAL ARCHIVE</p>
        <h1>GitHub Star<br /><span>分类索引</span></h1>
        <p className="intro-copy">从收藏噪声中提取可执行的技术信号。全部数据保存在本地，不请求 GitHub API。</p>
      </div>

      {error ? <div className="error">数据加载失败：未找到分类数据文件。</div> : (
        <>
          <section className="metrics" aria-label="索引概览">
            <div><small>REPOSITORIES</small><strong>{stars.length || "--"}</strong><span>已归档仓库</span></div>
            <div><small>CATEGORIES</small><strong>{categories.length || "--"}</strong><span>技术分类</span></div>
            <div><small>PINNED</small><strong>{pinned.size.toString().padStart(2, "0")}</strong><span>本地置顶</span></div>
            <div><small>CLASSIFIER</small><strong className="metric-text">RULES</strong><span>关键词规则</span></div>
          </section>

          <section className="overview-grid">
            <div className="panel distribution-panel">
              <div className="panel-title"><span>01 / 分类分布</span><small>CLICK TO FILTER</small></div>
              <div className="distribution-list">
                {categories.map((name) => <button type="button" onClick={() => setCategory(name)} className={category === name ? "selected" : ""} key={name}>
                  <span>{name}</span><i><b style={{ width: `${(counts[name] / Math.max(...Object.values(counts))) * 100}%` }} /></i><em>{counts[name]}</em>
                </button>)}
              </div>
            </div>
            <div className="panel featured-panel">
              <div className="panel-title"><span>02 / 重点仓库</span><small>INTEREST SCORE</small></div>
              <ol>
                {featured.map((item, index) => <li key={item.full_name}><span>{String(index + 1).padStart(2, "0")}</span><a href={item.html_url} target="_blank" rel="noreferrer">{item.full_name}</a><b>{item.interest_score}</b></li>)}
              </ol>
            </div>
          </section>

          <section className="controls" aria-label="筛选控制">
            <label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索仓库、描述、标签..." /></label>
            <div className="select-wrap"><span>分类</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option>全部</option>{categories.map((name) => <option key={name}>{name}</option>)}</select></div>
            <div className="select-wrap"><span>排序</span><select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}><option value="interest">兴趣分</option><option value="stars">GitHub Star</option></select></div>
            <output>{visibleStars.length} / {stars.length} REPOS</output>
          </section>

          <nav className="category-nav" aria-label="分类导航">
            <button type="button" className={category === "全部" ? "active" : ""} onClick={() => setCategory("全部")}>全部 <b>{stars.length}</b></button>
            {categories.map((name) => <button type="button" className={category === name ? "active" : ""} onClick={() => setCategory(name)} key={name}>{name} <b>{counts[name]}</b></button>)}
          </nav>

          <div className="repo-groups">
            {groups.map(([name, items]) => <RepoTable category={name} items={items} pinned={pinned} onTogglePin={togglePin} key={name} />)}
            {stars.length > 0 && visibleStars.length === 0 ? <p className="empty">未找到匹配仓库。</p> : null}
          </div>
        </>
      )}
      <footer>STAR//INDEX · {stars.length || "--"} REPOSITORIES · LOCAL FIRST</footer>
    </main>
  );
}
