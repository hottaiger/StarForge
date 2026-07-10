export type SortMode = "interest" | "stars";

export type StarRepository = {
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  category: string;
  confidence: number;
  interest_score: number;
  reason: string;
};

export type FilterOptions = {
  category: string;
  query: string;
  sort: SortMode;
  pinned: Set<string>;
};

export function getCategoryCounts(items: StarRepository[]) {
  return items.reduce<Record<string, number>>((counts, item) => {
    counts[item.category] = (counts[item.category] ?? 0) + 1;
    return counts;
  }, {});
}

export function filterAndSortStars(items: StarRepository[], options: FilterOptions) {
  const normalizedQuery = options.query.trim().toLowerCase();
  const scoreKey = options.sort === "stars" ? "stargazers_count" : "interest_score";

  return items
    .filter((item) => {
      const searchable = [item.full_name, item.description, item.language, item.category, item.reason, ...item.topics]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (options.category === "全部" || item.category === options.category) && searchable.includes(normalizedQuery);
    })
    .sort(
      (a, b) =>
        Number(options.pinned.has(b.full_name)) - Number(options.pinned.has(a.full_name)) ||
        b[scoreKey] - a[scoreKey] ||
        a.full_name.localeCompare(b.full_name),
    );
}

export function getFeaturedStars(items: StarRepository[]) {
  return [...items].sort((a, b) => b.interest_score - a.interest_score || b.stargazers_count - a.stargazers_count).slice(0, 5);
}
