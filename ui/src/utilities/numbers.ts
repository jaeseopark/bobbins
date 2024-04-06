import Fraction from "fraction.js";

import { Inch } from "../types";

const FRACTION_MAP = {
  "1/4": "¼",
  "1/2": "½",
  "3/4": "¾",
  "1/8": "⅛",
  "3/8": "⅜",
  "5/8": "⅝",
  "7/8": "⅞",
};

const substituteFractionUnicode = (s: string) =>
  Object.entries(FRACTION_MAP).reduce((acc, [ascii, unicode]) => {
    if (acc.includes(ascii)) {
      return acc.replace(ascii, unicode);
    }
    return acc;
  }, s);

const mmToInches = (mm: number, nearest: number): Inch => {
  const decimal = mm / 25.4;
  const normalized = Math.round(decimal / nearest) * nearest;
  let fraction = new Fraction(normalized).toFraction(true);
  fraction = substituteFractionUnicode(fraction).replace(" ", "");
  return { decimal, fraction };
};

export const cmToInchString = (cm: number, nearest = 0.125): string => mmToInches(cm * 10, nearest).fraction;
