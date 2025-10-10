import { Product } from "../../types";

/**
 * Returns the product description for preview or clipboard.
 */
export function getDescription(product: Product): string {
    return [
        product.name,
        product.introduction,
        product.keywords && Array.isArray(product.keywords)
            ? product.keywords.join(", ")
            : product.keywords,
        product.tips,
    ]
        .filter(Boolean)
        .join("\n\n");
}

/**
 * Returns the first thumbnail URL for a product.
 */
export function getFirstThumbnailUrl(product: Product): string | undefined {
    if (product.thumbnails && product.thumbnails.length > 0) {
        return product.thumbnails[0];
    }
}

/**
 * Opens the user guide in a new tab.
 */
export function openUserGuide() {
    window.open("/user-guide", "_blank", "noopener,noreferrer");
}

/**
 * Handles thumbnail upload for a product.
 */
export async function uploadThumbnail(productId: string, file: File): Promise<string> {
    // Example implementation, replace with actual upload logic
    const formData = new FormData();
    formData.append("thumbnail", file);
    const response = await fetch(`/api/products/${productId}/thumbnail`, {
        method: "POST",
        body: formData,
    });
    if (!response.ok) throw new Error("Upload failed");
    const data = await response.json();
    return data.url;
}