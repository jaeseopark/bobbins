import { SimpleGrid } from "@chakra-ui/react";

import { sigProducts } from "../state";

import ProductPreviewCard from "./ProductPreviewCard";

import "./ProductGrid.scss";

const ProductGridView = () => {
  return (
    <SimpleGrid className="product-grid" columns={[2, null, 5]} spacing="40px">
      {sigProducts.value.map((p) => (
        <ProductPreviewCard key={p.id} product={p} />
      ))}
    </SimpleGrid>
  );
};

export default ProductGridView;
