export type TodayInHistoryEvent = {
  readonly description?: string;
  readonly itemUrl?: string;
  readonly title: string;
  readonly year?: string;
};

export type TodayInHistorySource = {
  readonly buildUrl: (date: Date) => string;
  readonly homepageUrl?: string;
  readonly id: string;
  readonly name: string;
  readonly parse: (payload: unknown) => readonly TodayInHistoryEvent[];
};

export type TodayInHistorySelection = {
  readonly event: TodayInHistoryEvent | null;
  readonly source: TodayInHistorySource;
};
