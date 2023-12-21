import ProductGridView from "./components/ProductGridView";
import { ChakraProvider, Spinner } from "@chakra-ui/react";
import ProductListToolbar from "./components/ProductListToolbar";
import { sigIsLoading } from "./state";

const AppLayout = () => {
  if (sigIsLoading.value) {
    return <Spinner />;
  }

  return (
    <>
      <ProductListToolbar />
      <ProductGridView />
    </>
  );
};

export const App = () => (
  <ChakraProvider>
    <AppLayout />
  </ChakraProvider>
);
