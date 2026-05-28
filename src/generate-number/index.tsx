import { Action, ActionPanel, Detail, Form, Toast, showToast } from "@raycast/api";
import { useState } from "react";

import { parseInclusiveRange } from "../shared";
import generateNumber from "./generate-number";

type GenerateNumberFormValues = {
  max: string;
  min: string;
};

function GenerateNumberResult({
  onReset,
  value,
}: {
  onReset: () => void;
  value: number;
}) {
  return (
    <Detail
      actions={
        <ActionPanel>
          <Action.CopyToClipboard content={String(value)} title="Copy Number" />
          <Action title="Generate Again" onAction={onReset} />
        </ActionPanel>
      }
      markdown={`# ${value}`}
    />
  );
}

export default function GenerateNumberCommand() {
  const [defaultValues, setDefaultValues] = useState<GenerateNumberFormValues>({ max: "", min: "" });
  const [value, setValue] = useState<number | null>(null);

  async function handleSubmit(values: GenerateNumberFormValues) {
    try {
      const range = parseInclusiveRange(values.min, values.max);
      setDefaultValues(values);
      setValue(generateNumber(range));
    } catch (error) {
      await showToast({
        message: error instanceof Error ? error.message : "Unable to generate a number.",
        style: Toast.Style.Failure,
        title: "Invalid range",
      });
    }
  }

  if (value !== null) {
    return <GenerateNumberResult onReset={() => setValue(null)} value={value} />;
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} title="Generate Number" />
        </ActionPanel>
      }
    >
      <Form.TextField defaultValue={defaultValues.min} id="min" placeholder="e.g. 1" title="Minimum" />
      <Form.TextField defaultValue={defaultValues.max} id="max" placeholder="e.g. 10" title="Maximum" />
    </Form>
  );
}
