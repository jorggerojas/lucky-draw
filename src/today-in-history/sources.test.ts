import { describe, expect, it } from "vitest";

import {
  HISTORY_MUFFINLABS_SOURCE,
  NASA_APOD_SOURCE,
  QUOTABLE_SOURCE,
  TODAY_IN_HISTORY_SOURCES,
  USELESS_FACTS_SOURCE,
  WIKIFEEDS_SOURCE,
  ZEN_QUOTES_SOURCE,
  pickTodayInHistorySource,
} from "./sources";

describe("today-in-history sources", () => {
  it("selects sources deterministically", () => {
    expect(pickTodayInHistorySource(() => 0)).toBe(NASA_APOD_SOURCE);
    expect(pickTodayInHistorySource(() => 0.999)).toBe(HISTORY_MUFFINLABS_SOURCE);
    expect(TODAY_IN_HISTORY_SOURCES).toHaveLength(6);
  });

  it("normalizes NASA APOD payloads", () => {
    expect(
      NASA_APOD_SOURCE.parse({
        date: "2026-05-28",
        explanation: "A nebula.",
        hdurl: "https://example.com/apod.jpg",
        title: "APOD",
      }),
    ).toEqual([
      {
        description: "A nebula.",
        itemUrl: "https://example.com/apod.jpg",
        title: "APOD",
        year: "2026-05-28",
      },
    ]);
  });

  it("normalizes fact and quote payloads", () => {
    expect(USELESS_FACTS_SOURCE.parse({ permalink: "https://example.com/fact", text: "A fact." })[0]).toEqual({
      description: "Random fact",
      itemUrl: "https://example.com/fact",
      title: "A fact.",
    });

    expect(QUOTABLE_SOURCE.parse({ _id: "abc", author: "Ada", content: "Quote." })[0]).toEqual({
      description: "— Ada",
      itemUrl: "https://api.quotable.io/quotes/abc",
      title: "Quote.",
    });
  });

  it("normalizes quote and history feeds", () => {
    expect(ZEN_QUOTES_SOURCE.parse([{ a: "Zen", q: "Breathe." }])).toEqual([
      {
        description: "— Zen",
        title: "Breathe.",
      },
    ]);

    expect(
      WIKIFEEDS_SOURCE.parse({
        events: [
          {
            pages: [{ content_urls: { desktop: { page: "https://en.wikipedia.org/wiki/Example" } } }],
            text: "A Wikipedia event.",
            year: "1999",
          },
        ],
      }),
    ).toEqual([
      {
        description: "1999",
        itemUrl: "https://en.wikipedia.org/wiki/Example",
        title: "A Wikipedia event.",
        year: "1999",
      },
    ]);

    expect(
      HISTORY_MUFFINLABS_SOURCE.parse({
        data: {
          Events: [
            {
              links: [{ link: "https://example.com/story" }],
              text: "A history event.",
              year: "1900",
            },
          ],
        },
      }),
    ).toEqual([
      {
        description: "1900",
        itemUrl: "https://example.com/story",
        title: "A history event.",
        year: "1900",
      },
    ]);
  });
});
