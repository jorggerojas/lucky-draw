import { describe, expect, it } from "vitest";

import { formatTodayInHistoryEmptyMarkdown, formatTodayInHistoryErrorMarkdown, formatTodayInHistoryMarkdown } from "./today-in-history";

describe("today-in-history formatters", () => {
  it("builds markdown for content and empty/error states", () => {
    expect(
      formatTodayInHistoryMarkdown(
        { buildUrl: () => "", id: "source", name: "Source", parse: () => [], homepageUrl: "https://example.com" },
        { description: "Some context.", itemUrl: "https://example.com/story", title: "A story", year: "1900" },
      ),
    ).toContain("# A story");

    expect(
      formatTodayInHistoryEmptyMarkdown({ buildUrl: () => "", id: "source", name: "Source", parse: () => [] }),
    ).toContain("did not return any content");

    expect(formatTodayInHistoryErrorMarkdown("Source", "Boom")).toContain("Unable to load Source");
  });
});
