import { Action, ActionPanel, Detail, Form, Toast, showToast } from "@raycast/api";
import { useMemo, useState } from "react";

import { parsePositiveInteger } from "../shared";
import rollDice from "./roll-dice";

type RollDiceFormValues = {
  quantity: string;
  sides: string;
};

type RollDiceResult = {
  quantity: number;
  rolls: number[];
  sides: number;
};

function formatRollDiceMarkdown({ quantity, rolls, sides }: RollDiceResult): string {
  const total = rolls.reduce((sum, roll) => sum + roll, 0);

  return `# 🎲 ${total}\n\n**${quantity}d${sides}** → ${rolls.join(", ")}\n\nTap **Roll Again** for another throw.`;
}

function RollDiceResultView({ onReset, result }: { onReset: () => void; result: RollDiceResult }) {
  const total = useMemo(() => result.rolls.reduce((sum, roll) => sum + roll, 0), [result.rolls]);

  return (
    <Detail
      actions={
        <ActionPanel>
          <Action.CopyToClipboard content={String(total)} title="Copy Total" />
          <Action.CopyToClipboard content={result.rolls.join(", ")} title="Copy Rolls" />
          <Action title="Roll Again" onAction={onReset} />
        </ActionPanel>
      }
      markdown={formatRollDiceMarkdown(result)}
    />
  );
}

export default function RollDiceCommand() {
  const [formValues, setFormValues] = useState<RollDiceFormValues>({ quantity: "1", sides: "6" });
  const [result, setResult] = useState<RollDiceResult | null>(null);

  async function handleSubmit(values: RollDiceFormValues) {
    try {
      const quantity = parsePositiveInteger(values.quantity, "quantity");
      const sides = parsePositiveInteger(values.sides, "sides");

      const rolls = rollDice({ quantity, sides });
      setFormValues(values);
      setResult({ quantity, rolls, sides });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Invalid dice",
        message: error instanceof Error ? error.message : "Unable to roll dice.",
      });
    }
  }

  if (result !== null) {
    return (
      <RollDiceResultView
        onReset={() =>
          setResult({
            ...result,
            rolls: rollDice({ quantity: result.quantity, sides: result.sides }),
          })
        }
        result={result}
      />
    );
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} title="Roll Dice" />
        </ActionPanel>
      }
    >
      <Form.TextField defaultValue={formValues.quantity} id="quantity" placeholder="1" title="Quantity" />
      <Form.TextField defaultValue={formValues.sides} id="sides" placeholder="6" title="Sides" />
    </Form>
  );
}
