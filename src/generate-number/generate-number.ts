export type GenerateNumberOptions = {
  min: number;
  max: number;
};

export default function generateNumber({ min, max }: GenerateNumberOptions) {
  if (max < min) {
    throw new Error("Max must be greater than min");
  }
  if (min === max) {
    return min;
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}
