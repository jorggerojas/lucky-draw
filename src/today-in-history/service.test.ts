import { describe, expect, it, vi } from "vitest";

import { TodayInHistoryError, fetchTodayInHistory } from "./service";

describe("today-in-history service", () => {
  it("fetches and normalizes the selected source", async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      expect(url).toContain("history.muffinlabs.com/date/05/28");

      return {
        json: async () => ({
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
        ok: true,
      };
    });

    await expect(
      fetchTodayInHistory({
        date: new Date("2026-05-28T00:00:00.000Z"),
        fetchImpl,
        random: () => 0.999,
      }),
    ).resolves.toEqual({
      event: {
        description: "1900",
        itemUrl: "https://example.com/story",
        title: "A history event.",
        year: "1900",
      },
      source: expect.objectContaining({ id: "history-muffinlabs", name: "History Muffin Labs" }),
    });
  });

  it("returns empty when the selected source has no items", async () => {
    const fetchImpl = vi.fn(async () => ({
      json: async () => ({ data: { Events: [] } }),
      ok: true,
    }));

    await expect(
      fetchTodayInHistory({
        date: new Date("2026-05-28T00:00:00.000Z"),
        fetchImpl,
        random: () => 0.999,
      }),
    ).resolves.toMatchObject({ event: null });
  });

  it("wraps fetch failures with source context", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    });

    await expect(
      fetchTodayInHistory({
        fetchImpl,
        random: () => 0,
      }),
    ).rejects.toBeInstanceOf(TodayInHistoryError);
  });
});
