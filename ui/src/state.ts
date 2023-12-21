import { signal } from "@preact/signals";
import { Product } from "./types";
import { v4 as uuidv4 } from "uuid";
import getRandomName from "node-random-name";

export const sigProducts = signal<Product[]>([]);
export const addProduct = (p: Product) => {
  sigProducts.value = [...sigProducts.value, p];
  return p;
};
export const updateProduct = async (updated: Product) => {
  sigProducts.value = sigProducts.value.reduce((acc, next) => {
    if (next.id === updated.id) {
      acc.push(updated);
    } else {
      acc.push(next);
    }
    return acc;
  }, [] as Product[]);
}

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
  thumbnails: ["https://amerooniedesigns.com/wp-content/uploads/2021/12/paris-zipper-pouches.jpg"],
  sizes: {
    regular: [
      Math.round(5 + Math.random() * 100) / 10,
      Math.round(5 + Math.random() * 100) / 10,
      Math.round(5 + Math.random() * 100) / 10
    ]
  },
  tutorialLink: "https://www.youtube.com/watch?v=R_nu4COtBv4"
});

export const reset = () => {
  sigProducts.value = Array(5).fill(0).map(getTestProduct);
};

export const addTestProduct = () => addProduct(getTestProduct());
