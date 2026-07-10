"use client";

import type { StarRepository } from "../lib/stars";

type RepoTableProps = {
  category: string;
  items: StarRepository[];
  pinned: Set<string>;
  onTogglePin: (fullName: string) => void;
};

const number = new Intl.NumberFormat("zh-CN", { notation: "compact", maximumFractionDigits: 1 });

export function RepoTable({ category, items, pinned, onTogglePin }: RepoTableProps) {
  return (
    <section className="repo-section" id={`category-${encodeURIComponent(category)}`}>
      <div className="section-heading">
        <div>
          <span className="section-index">CLASS//{category}</span>
          <h2>{category}</h2>
        </div>
        <span>{items.length.toString().padStart(2, "0")} REPOS</span>
      </div>

      <div className="repo-table-wrap">
        <table className="repo-table">
          <thead>
            <tr>
              <th scope="col">仓库</th>
              <th scope="col">说明</th>
              <th scope="col">语言</th>
              <th scope="col">热度</th>
              <th scope="col">情报</th>
              <th scope="col">置顶</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isPinned = pinned.has(item.full_name);
              return (
                <tr className={isPinned ? "is-pinned" : ""} key={item.full_name}>
                  <td className="repo-name" data-label="仓库">
                    <a href={item.html_url} target="_blank" rel="noreferrer">
                      {item.full_name}<span aria-hidden="true"> ↗</span>
                    </a>
                  </td>
                  <td className="repo-description" data-label="说明">
                    <p>{item.description || "未提供项目简介"}</p>
                    <small>{item.reason}</small>
                  </td>
                  <td data-label="语言"><span className="language">{item.language || "--"}</span></td>
                  <td data-label="热度">
                    <strong>{number.format(item.stargazers_count)}</strong>
                    <small>STAR</small>
                  </td>
                  <td data-label="情报"><span className="score">{item.interest_score}<small>/100</small></span></td>
                  <td className="pin-cell" data-label="置顶">
                    <button
                      aria-label={`${isPinned ? "取消置顶" : "置顶"} ${item.full_name}`}
                      className={`pin-button ${isPinned ? "active" : ""}`}
                      onClick={() => onTogglePin(item.full_name)}
                      type="button"
                    >
                      {isPinned ? "★" : "☆"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
