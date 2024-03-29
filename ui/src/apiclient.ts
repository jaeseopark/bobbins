import { Product, ChatLogEntry } from "./types";

const sanitizeSizes = (p: Product) => {
  if (!Array.isArray(p.sizes) && typeof p.sizes === "object") {
    p.sizes = Object.entries(p.sizes as { [key: string]: number[] }).map(([alias, dimensions]) => ({
      alias,
      dimensions,
    }));
  }
  return p;
};

const sanitizeStitches = (p: Product) => {
  if (!p.stitches || Object.keys(p.stitches).length === 0) {
    p.stitches = {
      seamAllowance: p.seamAllowance,
      topStitch: p.topStitch,
      basteStitch: p.basteStitch,
    };
  }

  if (!p.stitches?.secondSeamAllowance) {
      p.stitches.secondSeamAllowance = 0;
  }

  return p;
};

const getProducts = (): Promise<Product[]> =>
  fetch("/api/products")
    .then((r) => r.json())
    .then(({ products }) => products.map(sanitizeSizes).map(sanitizeStitches));

const addProduct = (p: Product): Promise<Product> =>
  fetch("/api/products", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(p),
  })
    .then((r) => r.json())
    .then(({ product }) => product);

const updateProduct = (p: Product): Promise<Product> =>
  fetch(`/api/products/${p.id}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(p),
  })
    .then((r) => r.json())
    .then(({ product }) => product);

const ask = (payload: { question: string; log?: ChatLogEntry[] }): Promise<{ answer: string; log: ChatLogEntry[] }> =>
  fetch("/api/ask", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).then((r) => r.json());

export default {
  getProducts,
  addProduct,
  updateProduct,
  ask,
};
