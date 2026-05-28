import { Action, ActionPanel, Detail } from "@raycast/api";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import {
  formatTodayInHistoryEmptyMarkdown,
  formatTodayInHistoryErrorMarkdown,
  formatTodayInHistoryMarkdown,
} from "./today-in-history";
import { fetchTodayInHistory, TodayInHistoryError } from "./service";
import type { TodayInHistorySelection, TodayInHistorySource } from "./types";

type TodayInHistoryState =
  | { readonly kind: "loading" }
  | ({ readonly kind: "ready" } & TodayInHistorySelection)
  | { readonly kind: "empty"; readonly source: TodayInHistorySource }
  | { readonly kind: "error"; readonly message: string; readonly source?: TodayInHistorySource };

function TodayInHistoryActions({ source, onRefresh }: { onRefresh: () => void; source?: TodayInHistorySource }) {
  const actions: ReactNode[] = [];

  if (source?.homepageUrl) {
    actions.push(<Action.OpenInBrowser key="open-source" title="Open Source" url={source.homepageUrl} />);
  }

  actions.push(<Action key="refresh" title="Refresh" onAction={onRefresh} />);

  return <ActionPanel>{actions}</ActionPanel>;
}

function TodayInHistoryView({ state, onRefresh }: { onRefresh: () => void; state: TodayInHistoryState }) {
  if (state.kind === "loading") {
    return <Detail isLoading markdown="# Today in History\n\nLoading a random source..." />;
  }

  if (state.kind === "error") {
    return (
      <Detail
        actions={<TodayInHistoryActions onRefresh={onRefresh} source={state.source} />}
        markdown={formatTodayInHistoryErrorMarkdown(state.source?.name, state.message)}
      />
    );
  }

  if (state.kind === "empty") {
    return (
      <Detail
        actions={<TodayInHistoryActions onRefresh={onRefresh} source={state.source} />}
        markdown={formatTodayInHistoryEmptyMarkdown(state.source)}
      />
    );
  }

  const { event, source } = state;
  const openUrl = event.itemUrl ?? source.homepageUrl;

  return (
    <Detail
      actions={
        <ActionPanel>
          {openUrl ? <Action.OpenInBrowser title="Open Link" url={openUrl} /> : null}
          <Action.CopyToClipboard content={event.title} title="Copy Title" />
          <Action title="Do it again" onAction={onRefresh} />
        </ActionPanel>
      }
      markdown={formatTodayInHistoryMarkdown(source, event)}
      metadata={
        <Detail.Metadata>
          {event.year ? <Detail.Metadata.Label title="Year" text={event.year} /> : null}
          <Detail.Metadata.Label title="Source" text={source.name} />
          {source.homepageUrl ? (
            <Detail.Metadata.Link target={source.homepageUrl} text={source.homepageUrl} title="Source Link" />
          ) : null}
          {event.itemUrl ? <Detail.Metadata.Link target={event.itemUrl} text={event.itemUrl} title="Item Link" /> : null}
        </Detail.Metadata>
      }
    />
  );
}

export default function TodayInHistoryCommand() {
  const [refreshCount, setRefreshCount] = useState(0);
  const [state, setState] = useState<TodayInHistoryState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    setState({ kind: "loading" });

    void fetchTodayInHistory()
      .then((result) => {
        if (cancelled) {
          return;
        }

        setState(result.event ? { kind: "ready", ...result } : { kind: "empty", source: result.source });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        if (error instanceof TodayInHistoryError) {
          setState({ kind: "error", message: error.message, source: error.source });
          return;
        }

        setState({ kind: "error", message: error instanceof Error ? error.message : "Unexpected error" });
      });

    return () => {
      cancelled = true;
    };
  }, [refreshCount]);

  return <TodayInHistoryView onRefresh={() => setRefreshCount((count) => count + 1)} state={state} />;
}
