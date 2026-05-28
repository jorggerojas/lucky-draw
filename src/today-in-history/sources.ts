import { randomIntInclusive } from "../shared";
import type { TodayInHistoryEvent, TodayInHistorySource } from "./types";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function getRecord(value: unknown, key: string): JsonRecord | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const nested = value[key];

  return isRecord(nested) ? nested : undefined;
}

function getArray(value: unknown, key: string): readonly unknown[] {
  if (!isRecord(value)) {
    return [];
  }

  const nested = value[key];

  return Array.isArray(nested) ? nested : [];
}

function asArray(value: unknown): readonly unknown[] {
  return Array.isArray(value) ? value : [];
}

function getOptionalString(value: unknown, key: string): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const nested = value[key];

  return typeof nested === "string" && nested.trim().length > 0 ? nested.trim() : undefined;
}

function buildEvent(event: TodayInHistoryEvent): readonly TodayInHistoryEvent[] {
  return [event];
}

function parseNasaApod(payload: unknown): readonly TodayInHistoryEvent[] {
  const title = getOptionalString(payload, "title");

  if (!title) {
    return [];
  }

  return buildEvent({
    description: getOptionalString(payload, "explanation"),
    itemUrl: getOptionalString(payload, "hdurl") ?? getOptionalString(payload, "url"),
    title,
    year: getOptionalString(payload, "date"),
  });
}

function parseUselessFacts(payload: unknown): readonly TodayInHistoryEvent[] {
  const fact = getOptionalString(payload, "text") ?? getOptionalString(payload, "fact");

  if (!fact) {
    return [];
  }

  return buildEvent({
    description: "Random fact",
    itemUrl: getOptionalString(payload, "permalink"),
    title: fact,
  });
}

function parseQuotable(payload: unknown): readonly TodayInHistoryEvent[] {
  const content = getOptionalString(payload, "content");

  if (!content) {
    return [];
  }

  const author = getOptionalString(payload, "author");
  const quoteId = getOptionalString(payload, "_id") ?? getOptionalString(payload, "id");

  return buildEvent({
    description: author ? `— ${author}` : undefined,
    itemUrl: quoteId ? `https://api.quotable.io/quotes/${quoteId}` : undefined,
    title: content,
  });
}

function parseZenQuotes(payload: unknown): readonly TodayInHistoryEvent[] {
  const first = asArray(payload)[0];
  const quote = getOptionalString(first, "q");

  if (!quote) {
    return [];
  }

  const author = getOptionalString(first, "a");

  return buildEvent({
    description: author ? `— ${author}` : undefined,
    title: quote,
  });
}

function extractWikiPageUrl(value: unknown): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const contentUrls = getRecord(value, "content_urls");
  const desktop = getRecord(contentUrls, "desktop");

  return getOptionalString(desktop, "page") ?? getOptionalString(value, "canonical");
}

function parseWikifeeds(payload: unknown): readonly TodayInHistoryEvent[] {
  return getArray(payload, "events")
    .map((event) => {
      if (!isRecord(event)) {
        return null;
      }

      const title = getOptionalString(event, "text");

      if (!title) {
        return null;
      }

      const pages = getArray(event, "pages");
      const firstPage = pages[0];

      return {
        description: getOptionalString(event, "year"),
        itemUrl: extractWikiPageUrl(firstPage),
        title,
        year: getOptionalString(event, "year"),
      } satisfies TodayInHistoryEvent;
    })
    .filter((event): event is TodayInHistoryEvent => event !== null);
}

function parseHistoryMuffinLabs(payload: unknown): readonly TodayInHistoryEvent[] {
  const data = getRecord(payload, "data");

  if (!data) {
    return [];
  }

  return getArray(data, "Events")
    .map((event) => {
      if (!isRecord(event)) {
        return null;
      }

      const title = getOptionalString(event, "text");

      if (!title) {
        return null;
      }

      const links = getArray(event, "links");
      const firstLink = links[0];

      return {
        description: getOptionalString(event, "year"),
        itemUrl: getOptionalString(firstLink, "link"),
        title,
        year: getOptionalString(event, "year"),
      } satisfies TodayInHistoryEvent;
    })
    .filter((event): event is TodayInHistoryEvent => event !== null);
}

export const NASA_APOD_SOURCE: TodayInHistorySource = {
  buildUrl: (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `https://api.nasa.gov/planetary/apod?date=${year}-${month}-${day}&api_key=DEMO_KEY`;
  },
  homepageUrl: "https://apod.nasa.gov/apod/astropix.html",
  id: "nasa-apod",
  name: "NASA APOD",
  parse: parseNasaApod,
};

export const USELESS_FACTS_SOURCE: TodayInHistorySource = {
  buildUrl: () => "https://uselessfacts.jsph.pl/api/v2/facts/random?language=en",
  homepageUrl: "https://uselessfacts.jsph.pl/",
  id: "uselessfacts",
  name: "uselessfacts.jsph.pl",
  parse: parseUselessFacts,
};

export const QUOTABLE_SOURCE: TodayInHistorySource = {
  buildUrl: () => "https://api.quotable.io/random",
  homepageUrl: "https://github.com/lukePeavey/quotable",
  id: "quotable",
  name: "Quotable",
  parse: parseQuotable,
};

export const ZEN_QUOTES_SOURCE: TodayInHistorySource = {
  buildUrl: () => "https://zenquotes.io/api/random",
  homepageUrl: "https://zenquotes.io/",
  id: "zenquotes",
  name: "ZenQuotes",
  parse: parseZenQuotes,
};

export const WIKIFEEDS_SOURCE: TodayInHistorySource = {
  buildUrl: (date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;
  },
  homepageUrl: "https://en.wikipedia.org/wiki/Wikipedia:On_this_day",
  id: "wikifeeds",
  name: "Wikifeeds",
  parse: parseWikifeeds,
};

export const HISTORY_MUFFINLABS_SOURCE: TodayInHistorySource = {
  buildUrl: (date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `https://history.muffinlabs.com/date/${month}/${day}`;
  },
  homepageUrl: "https://history.muffinlabs.com/",
  id: "history-muffinlabs",
  name: "History Muffin Labs",
  parse: parseHistoryMuffinLabs,
};

export const TODAY_IN_HISTORY_SOURCES = [
  NASA_APOD_SOURCE,
  USELESS_FACTS_SOURCE,
  QUOTABLE_SOURCE,
  ZEN_QUOTES_SOURCE,
  WIKIFEEDS_SOURCE,
  HISTORY_MUFFINLABS_SOURCE,
] as const;

export function pickTodayInHistorySource(random = Math.random): TodayInHistorySource {
  return TODAY_IN_HISTORY_SOURCES[randomIntInclusive(0, TODAY_IN_HISTORY_SOURCES.length - 1, random)];
}
