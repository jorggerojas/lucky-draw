export type RollDiceOptions = {
  quantity?: number;
  random?: () => number;
  sides?: number;
};

export default function rollDice({ quantity = 1, random = Math.random, sides = 6 }: RollDiceOptions): number[] {
  return Array.from({ length: quantity }, () => Math.floor(random() * sides) + 1);
}
