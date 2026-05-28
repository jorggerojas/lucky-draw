export type FlipCoinOptions = "heads" | "tails";

export default function flipCoin(random = Math.random): "heads" | "tails" {
  return random() < 0.5 ? "tails" : "heads";
}
