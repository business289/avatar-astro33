import { describe, expect, it } from "vitest";
import {
  articleReadMinutes,
  articleWordCount,
  blogArticles,
  formatPostDate,
  getArticleBySlug,
  getPublishedArticles,
} from "./blogArticles";

describe("blog articles", () => {
  it("publishes four articles, newest first, with unique slugs", () => {
    const list = getPublishedArticles();
    expect(list).toHaveLength(4);
    const dates = list.map((a) => a.date);
    expect([...dates].sort().reverse()).toEqual(dates);
    expect(new Set(list.map((a) => a.slug)).size).toBe(4);
  });

  it("excludes drafts from the public list and from slug lookup", () => {
    const draft = { ...blogArticles[0], slug: "draft-x", published: false };
    blogArticles.push(draft);
    try {
      expect(getPublishedArticles().some((a) => a.slug === "draft-x")).toBe(false);
      expect(getArticleBySlug("draft-x")).toBeUndefined();
    } finally {
      blogArticles.pop();
    }
  });

  it("derives reading time from the real word count", () => {
    for (const a of getPublishedArticles()) {
      expect(articleWordCount(a)).toBeGreaterThan(300);
      expect(articleReadMinutes(a)).toBe(Math.max(1, Math.round(articleWordCount(a) / 200)));
    }
  });

  it("formats dates like 24 Oct 2026 and has no 2024 titles", () => {
    expect(formatPostDate("2026-10-24")).toBe("24 Oct 2026");
    for (const a of blogArticles) expect(a.title).not.toMatch(/2024/);
  });

  it("every article has local photo, alt text and non-dead related links", () => {
    for (const a of blogArticles) {
      expect(a.image.startsWith("/images/blog/")).toBe(true);
      expect(a.imageAlt.length).toBeGreaterThan(10);
      for (const l of a.related) expect(["/birth-chart", "/zodiac", "/horoscopes"]).toContain(l.to);
    }
  });
});
