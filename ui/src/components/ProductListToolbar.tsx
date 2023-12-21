import { Button } from "@chakra-ui/button";
import { addTestProduct, reset } from "../state";

const ProductListToolbar = () => {
  return (
    <div>
      <Button onClick={addTestProduct}>Add</Button>
      <Button onClick={reset}>Reset</Button>
    </div>
  );
};

export default ProductListToolbar;
