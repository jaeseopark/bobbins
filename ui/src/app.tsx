import ProductGridView from "./components/ProductGridView";
import { ChakraProvider } from "@chakra-ui/react";
import ProductListToolbar from "./components/ProductListToolbar";

export function App() {
  return (
    <>
      <ChakraProvider>
        <ProductListToolbar />
        <ProductGridView />
      </ChakraProvider>
    </>
  );
}
