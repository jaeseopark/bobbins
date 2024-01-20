import ProductGridView from "./components/ProductGridView";
import { ChakraProvider, Spinner } from "@chakra-ui/react";
import ProductListToolbar from "./components/ProductListToolbar";
import { sigIsLoading } from "./state";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Link } from "@chakra-ui/react";

import UserGuideTemplate from "./components/UserGuideTemplate";
import { JSX } from "preact/jsx-runtime";
import CsMessageComposer from "./components/CsMessageComposer";

import "./app.scss";

const Inventory = () => {
  if (sigIsLoading.value) {
    return <Spinner />;
  }

  return (
    <div className="inventory">
      <ProductListToolbar />
      <ProductGridView />
    </div>
  );
};

type View = [string, string, JSX.Element];

const VIEWS: View[] = [
  ["/", "Inventory", <Inventory />],
  ["cs", "CS Message Composer", <CsMessageComposer />],
  ["/templates/userguide", "User Guide Template", <UserGuideTemplate />],
];

export const App = () => (
  <ChakraProvider>
    <div className="navbar">
      {VIEWS.map(([path, name]) => (
        <Link key={name} href={path}>
          {name}
        </Link>
      ))}
    </div>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Navigate to="/" replace />} />
        {VIEWS.map(([path, _, element]) => (
          <Route path={path} element={element} />
        ))}
      </Routes>
    </BrowserRouter>
  </ChakraProvider>
);
