import ProductGridView from "./components/ProductGridView";
import { ChakraProvider, Spinner } from "@chakra-ui/react";
import ProductListToolbar from "./components/ProductListToolbar";
import { sigIsLoading } from "./state";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import UserGuideTemplate from "./components/UserGuideTemplate";

const MainView = () => {
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
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/" element={<MainView />} />
        <Route path="/templates/userguide" element={<UserGuideTemplate />} />
      </Routes>
    </BrowserRouter>
  </ChakraProvider>
);
