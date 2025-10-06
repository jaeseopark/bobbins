import { v4 as uuidv4 } from "uuid";
import { Product, StitchKey } from "src/types";

export function getProductDefaultValues(product?: Product): Product {
    return {
        id: product?.id || uuidv4().toString(),
        name: product?.name || "New Product",
        date: product?.date || Date.now(),
        introduction: product?.introduction || "",
        keywords: product?.keywords || [],
        materials: product?.materials || [],
        duration: product?.duration || 30,
        stitches: product?.stitches || ({} as Record<StitchKey, number>),
        sizes: product?.sizes || [],
        tutorialLink: product?.tutorialLink || "https://youtube.com/",
        numMissingSeamAllowances: product?.numMissingSeamAllowances || 0,
        containsNotches: product?.containsNotches ?? true,
        tips: product?.tips || "",
    };
}
