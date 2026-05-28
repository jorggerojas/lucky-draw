export type PickRandomItemOptions = {
  items: string[] | string;
};

export default function pickRandomItem({ items }: PickRandomItemOptions) {
  if (typeof items === "string") {
    return pickRandomItem({ items: items.split(",").map((item) => item.trim()) });
  }
  return items[Math.floor(Math.random() * items.length)];
}
