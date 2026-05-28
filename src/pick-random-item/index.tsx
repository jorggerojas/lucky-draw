import { Action, ActionPanel, Detail, Form, Toast, showToast } from "@raycast/api";
import { useState } from "react";

import { pickRandom } from "../shared/random";
import { splitInputList } from "../shared/input";

type PickRandomItemFormValues = {
  items: string;
};

function PickRandomItemResult({ onReset, value }: { onReset: () => void; value: string }) {
  return (
    <Detail
      actions={
        <ActionPanel>
          <Action.CopyToClipboard content={value} title="Copy Item" />
          <Action title="Pick Again" onAction={onReset} />
        </ActionPanel>
      }
      markdown={`# ${value}`}
    />
  );
}

export default function PickRandomItemCommand() {
  const [defaultValues, setDefaultValues] = useState<PickRandomItemFormValues>({ items: "" });
  const [value, setValue] = useState<string | null>(null);

  async function handleSubmit(values: PickRandomItemFormValues) {
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
    setValue(pickRandom(sanitizedItems));
  }

  if (value !== null) {
    return <PickRandomItemResult onReset={() => setValue(null)} value={value} />;
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} title="Pick Random Item" />
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
