import { Product } from "./types";

const getProducts = (): Promise<Product[]> => fetch("/api/products").then(r => r.json()).then(({ products }) => products);

const addProduct = (p: Product): Promise<Product> => fetch("/api/products", {
    method: "POST",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(p)
}).then(r => r.json()).then(({ product }) => product)

const updateProduct = (p: Product): Promise<Product> => fetch(`/api/products/${p.id}`, {
    method: "PUT",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(p)
}).then(r => r.json()).then(({ product }) => product)

export default {
    getProducts,
    addProduct,
    updateProduct
}