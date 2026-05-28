import { Action, ActionPanel, Detail } from "@raycast/api";
import { useState } from "react";

import flipCoin from "./flip-coin";

const COMMAND_ENTER_ICON = "⌘↵";
function formatFlipCoinMarkdown(result: "heads" | "tails"): string {
  const emoji = result === "heads" ? "🪙" : "🎯";
  const title = result === "heads" ? "Heads" : "Tails";

  return `# ${emoji} ${title}		\n\nHit **Flip Again** (${COMMAND_ENTER_ICON}) for another toss.`;
}

export default function FlipCoinCommand() {
  const [result, setResult] = useState<"heads" | "tails">(() => flipCoin());

  return (
    <Detail
      actions={
        <ActionPanel>
          <Action.CopyToClipboard content={result} title="Copy Result" />
          <Action title="Flip Again" onAction={() => setResult(flipCoin())} />
        </ActionPanel>
      }
      markdown={formatFlipCoinMarkdown(result)}
    />
  );
}
