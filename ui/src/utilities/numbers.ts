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

export const mmToInchString = (mm: number, nearest = 0.125): string => mmToInches(mm, nearest).fraction;
export const cmToInchString = (cm: number, nearest = 0.125): string => mmToInches(cm * 10, nearest).fraction;

export const bulkConvertUnits = (text: string): string => {
  return text.replace(/(\d+\.?\d?)\s?(cm|mm)/g, (token) => {
    const matchArray = /(\d+\.?\d?)\s?(cm|mm)/g.exec(token);
    if (!matchArray) {
      console.log("no match: " + token);
      return token;
    }

    const number = parseFloat(matchArray[1]);
    const unit = matchArray[2];

    console.log(`match found: array=${matchArray} number=${number} unit=${unit}`);
    if (unit === "cm") {
      return `${token} (${cmToInchString(number)}")`;
    } else if (unit === "mm") {
      return `${token} (${mmToInchString(number)}")`;
    }
    throw new Error(`Unsupported unit: ${unit}`);
  });
};
