import { pickTodayInHistorySource } from "./sources";
import type { TodayInHistorySelection, TodayInHistorySource } from "./types";

type HistoryResponse = {
  readonly json: () => Promise<unknown>;
  readonly ok: boolean;
};

export type TodayInHistoryFetch = (url: string) => Promise<HistoryResponse>;

export type TodayInHistoryOptions = {
  readonly date?: Date;
  readonly fetchImpl?: TodayInHistoryFetch;
  readonly random?: () => number;
};

export class TodayInHistoryError extends Error {
  readonly cause?: unknown;
  readonly source: TodayInHistorySource;

  constructor(message: string, source: TodayInHistorySource, cause?: unknown) {
    super(message);
    this.cause = cause;
    this.name = "TodayInHistoryError";
    this.source = source;
    Object.setPrototypeOf(this, TodayInHistoryError.prototype);
  }
}

export async function fetchTodayInHistory(options: TodayInHistoryOptions = {}): Promise<TodayInHistorySelection> {
  const source = pickTodayInHistorySource(options.random);
  const date = options.date ?? new Date();
  const fetchImpl = options.fetchImpl ?? fetch;

  let response: HistoryResponse;

  try {
    response = await fetchImpl(source.buildUrl(date));
  } catch (error) {
    throw new TodayInHistoryError(`Unable to load ${source.name}.`, source, error);
  }

  if (!response.ok) {
    throw new TodayInHistoryError(`Unable to load ${source.name}.`, source);
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch (error) {
    throw new TodayInHistoryError(`Unable to read ${source.name}.`, source, error);
  }

  let event: TodayInHistorySelection["event"] = null;

  try {
    event = source.parse(payload)[0] ?? null;
  } catch (error) {
    throw new TodayInHistoryError(`Unable to normalize ${source.name}.`, source, error);
  }

  return { event, source };
}
