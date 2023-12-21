export function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const getDimensionsAsString = ([x, y, z]: number[], cmToInchString: (cm: number) => string): string =>
    `${x.toFixed(1)}x${y.toFixed(1)}x${z.toFixed(1)} cm / ${cmToInchString(x)}x${cmToInchString(y)}x${cmToInchString(
        z
    )} in`;