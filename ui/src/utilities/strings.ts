export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const getDimensionsAsString = (dimensions: number[], cmToInchString: (cm: number) => string): string => {
  const composed = dimensions.reduce(
    (acc, next) => {
      acc.cm.push(next.toFixed(1));
      acc.inches.push(cmToInchString(next));
      return acc;
    },
    {
      cm: [] as string[],
      inches: [] as string[],
    },
  );

  return `${composed.cm.join("x")} cm / ${composed.inches.join("x")} in`;
};
