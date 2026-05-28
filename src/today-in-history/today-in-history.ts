import type { TodayInHistoryEvent, TodayInHistorySource } from "./types";

export function formatTodayInHistoryMarkdown(source: TodayInHistorySource, event: TodayInHistoryEvent): string {
  const sections = [`# ${event.title}`];

  if (event.year) {
    sections.push("", `**Year:** ${event.year}`);
  }

  if (event.description) {
    sections.push("", event.description);
  }

  sections.push("", `---`, `**Source:** ${source.name}`);

  return sections.join("\n");
}

export function formatTodayInHistoryEmptyMarkdown(source: TodayInHistorySource): string {
  return [`# No story found`, "", `${source.name} did not return any content for today.`].join("\n");
}

export function formatTodayInHistoryErrorMarkdown(sourceName: string | undefined, message: string): string {
  const heading = sourceName ? `# Unable to load ${sourceName}` : "# Unable to load Today in History";

  return [heading, "", message].join("\n");
}
