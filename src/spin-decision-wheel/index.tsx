import { Action, ActionPanel, Detail, Form, Toast, showToast } from "@raycast/api";
import { useState } from "react";

import { splitInputList } from "../shared/input";
import spinDecisionWheel from "./spin-decision-wheel";

type SpinDecisionWheelFormValues = {
  items: string;
};

function SpinDecisionWheelResult({ onReset, value }: { onReset: () => void; value: string }) {
  return (
    <Detail
      actions={
        <ActionPanel>
          <Action.CopyToClipboard content={value} title="Copy Winner" />
          <Action title="Spin Again" onAction={onReset} />
        </ActionPanel>
      }
      markdown={`# Winner\n\n${value}`}
    />
  );
}

export default function SpinDecisionWheelCommand() {
  const [defaultValues, setDefaultValues] = useState<SpinDecisionWheelFormValues>({ items: "" });
  const [value, setValue] = useState<string | null>(null);

  async function handleSubmit(values: SpinDecisionWheelFormValues) {
    const sanitizedItems = splitInputList(values.items);

    if (sanitizedItems.length === 0) {
      await showToast({
        message: "Add at least one non-empty option.",
        style: Toast.Style.Failure,
        title: "No options found",
      });
      return;
    }

    setDefaultValues(values);
    setValue(spinDecisionWheel({ items: sanitizedItems }));
  }

  if (value !== null) {
    return <SpinDecisionWheelResult onReset={() => setValue(null)} value={value} />;
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} title="Spin Decision Wheel" />
        </ActionPanel>
      }
    >
      <Form.TextArea
        defaultValue={defaultValues.items}
        id="items"
        placeholder="One option per line or comma-separated"
        title="Options"
      />
    </Form>
  );
}
