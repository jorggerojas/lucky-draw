export type SpinDecisionWheelOptions = {
  items: string[] | string;
};

export default function spinDecisionWheel({ items }: SpinDecisionWheelOptions) {
  if (typeof items === "string") {
    return spinDecisionWheel({ items: items.split(",").map((item) => item.trim()) });
  }
  return items[Math.floor(Math.random() * items.length)];
}
