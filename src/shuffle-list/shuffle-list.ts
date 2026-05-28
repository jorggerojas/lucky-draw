export type ShuffleListOptions = {
  list: string[] | string;
};

function shuffle<T>(list: T[]): T[] {
  return list.sort(() => Math.random() - 0.5);
}

export default function shuffleList({ list }: ShuffleListOptions) {
  if (typeof list === "string") {
    return shuffleList({ list: list.split(",").map((item) => item.trim()) });
  }
  return shuffle(list);
}
