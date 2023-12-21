import { sigProducts } from "../state";
import { SimpleGrid } from "@chakra-ui/react";
import ProductPreviewCard from "./ProductPreviewCard";

const ProductGridView = () => {
  return (
    <SimpleGrid columns={[2, null, 5]} spacing="40px">
      {sigProducts.value.map((p) => (
        <ProductPreviewCard key={p.id} product={p} />
      ))}
    </SimpleGrid>
  );
};

export default ProductGridView;
