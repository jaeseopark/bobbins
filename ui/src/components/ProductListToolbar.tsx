import { Button } from "@chakra-ui/button";
import { addTestProduct } from "../state";

const ProductListToolbar = () => {
  return (
    <div className="product-grid-toolbar">
      <Button onClick={addTestProduct}>Add</Button>
    </div>
  );
};

export default ProductListToolbar;
