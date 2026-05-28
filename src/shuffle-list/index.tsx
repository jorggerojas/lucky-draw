import { Action, ActionPanel, Detail, Form, Toast, showToast } from "@raycast/api";
import { useState } from "react";

import { shuffleList } from "../shared/random";
import { splitInputList } from "../shared/input";

type ShuffleListFormValues = {
  items: string;
};

function formatMarkdown(items: readonly string[]): string {
  return `# Shuffled List\n\n${items.map((item) => `- ${item}`).join("\n")}`;
}

function ShuffleListResult({ onReset, value }: { onReset: () => void; value: string[] }) {
  return (
    <Detail
      actions={
        <ActionPanel>
          <Action.CopyToClipboard content={value.join("\n")} title="Copy Shuffled List" />
          <Action title="Shuffle Again" onAction={onReset} />
        </ActionPanel>
      }
      markdown={formatMarkdown(value)}
    />
  );
}

export default function ShuffleListCommand() {
  const [defaultValues, setDefaultValues] = useState<ShuffleListFormValues>({ items: "" });
  const [value, setValue] = useState<string[] | null>(null);

  async function handleSubmit(values: ShuffleListFormValues) {
    const sanitizedItems = splitInputList(values.items);

    if (sanitizedItems.length === 0) {
      await showToast({
        message: "Add at least one non-empty item.",
        style: Toast.Style.Failure,
        title: "No items found",
      });
      return;
    }

    setDefaultValues(values);
    setValue(shuffleList(sanitizedItems));
  }

  if (value !== null) {
    return <ShuffleListResult onReset={() => setValue(null)} value={value} />;
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} title="Shuffle List" />
        </ActionPanel>
      }
    >
      <Form.TextArea
        defaultValue={defaultValues.items}
        id="items"
        placeholder="One item per line or comma-separated"
        title="Items"
      />
    </Form>
  );
}
