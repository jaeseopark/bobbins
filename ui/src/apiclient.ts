import ReconnectingWebSocket from "reconnecting-websocket";

import { ChatLogEntry, Product, ProductLocalFileStat, WebsocketListener } from "./types";

const GPT_MAX_NUM_TURNS = 5;

const WEBSOCKET_LISTENERS: WebsocketListener[] = [];

if (localStorage.getItem("dev")) {
  new ReconnectingWebSocket(`wss://${window.location.hostname}/api/ws`).onmessage = ({ data }) => {
    const message = JSON.parse(data);
    WEBSOCKET_LISTENERS.forEach((listener) => listener(message));
  };
}

// TODO migrate to @sanitized in the backend code base
const sanitizeSizes = (p: Product) => {
  if (!Array.isArray(p.sizes) && typeof p.sizes === "object") {
    p.sizes = Object.entries(p.sizes as { [key: string]: number[] }).map(([alias, dimensions]) => ({
      alias,
      dimensions,
    }));
  }
  return p;
};

// TODO migrate to @sanitized in the backend code base
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

const deleteProduct = (productId: string): Promise<void> =>
  fetch(`/api/products/${productId}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).then((r) => {
    if (r.status >= 400) {
      throw new Error("Delete failed w/ status code >= 400");
    }
  });

const uploadThumbnail = (p: Product, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file, "thumbnail.jpg");

  return fetch(`/api/products/${p.id}/thumbnail`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      // "Content-Type": "multipart/form-data",
    },
    body: formData,
  })
    .then((r) => r.json())
    .then(({ path }) => path);
};

const ask = (payload: { question: string; log?: ChatLogEntry[] }): Promise<{ answer: string; log: ChatLogEntry[] }> =>
  fetch("/api/ask", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question: payload.question, log: payload.log?.slice(-GPT_MAX_NUM_TURNS) }),
  }).then((r) => {
    if (!r.ok) {
      throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    }
    return r.json();
  });

const generateWrittenInstructions = (productId: string): Promise<void> =>
  fetch(`/api/products/${productId}/transcribe`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).then((r) => r.json());

const getLocalFileStats = (productId: string): Promise<{ stats: ProductLocalFileStat[] }> =>
  fetch(`/api/products/${productId}/stats`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).then((r) => r.json());

const addWsListener = (listener: WebsocketListener) => {
  WEBSOCKET_LISTENERS.push(listener);
  console.log("Websocket listner added");
};

const removeWsListener = (listener: WebsocketListener) => {
  const i = WEBSOCKET_LISTENERS.findIndex((listenreInArray) => listenreInArray === listener);
  if (i >= 0) {
    WEBSOCKET_LISTENERS.splice(i, 1);
  }
};

export default {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  uploadThumbnail,
  ask,
  generateWrittenInstructions,
  addWsListener,
  removeWsListener,
  getLocalFileStats,
};
