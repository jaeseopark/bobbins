import { signal } from "@preact/signals";
import getRandomName from "node-random-name";
import { v4 as uuidv4 } from "uuid";

import { Product } from "./types";

import apiclient from "./apiclient";

export const sigIsLoading = signal(true);
export const sigProducts = signal<Product[]>([]);
export const addProduct = (p: Product) =>
  apiclient.addProduct(p).then((added) => {
    sigProducts.value = [...sigProducts.value, added];
    return added;
  });
export const updateProduct = async (p: Product) =>
  apiclient.updateProduct(p).then((updated) => {
    sigProducts.value = sigProducts.value.reduce((acc, next) => {
      if (next.id === updated.id) {
        acc.push(updated);
      } else {
        acc.push(next);
      }
      return acc;
    }, [] as Product[]);
    return updated;
  });

apiclient.getProducts().then((products) => {
  sigProducts.value = products;
  sigIsLoading.value = false;
});

/**
 * All code below this line is only for local dev/test purposes.
 */
const getTestProduct = (): Product => ({
  id: uuidv4().toString(),
  name: getRandomName({ first: true, gender: "female", random: Math.random }),
  date: Date.now(),
  files: [],
  keywords: ["beginner friendly"],
  duration: Math.round(30 + Math.random() * 30), // minutes
  thumbnails: [],
  sizes: [
    {
      alias: "regular",
      dimensions: [
        Math.round(5 + Math.random() * 100) / 10,
        Math.round(5 + Math.random() * 100) / 10,
        Math.round(5 + Math.random() * 100) / 10,
      ],
    },
  ],
  tutorialLink: "https://www.youtube.com/watch?v=R_nu4COtBv4",
  stitches: {},
  containsNotches: false,
  numMissingSeamAllowances: 0,
  tips: "",
});

export const addTestProduct = () => addProduct(getTestProduct());
