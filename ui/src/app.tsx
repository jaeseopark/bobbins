import ProductGridView from "./components/ProductGridView";
import { ChakraProvider, Spinner } from "@chakra-ui/react";
import ProductListToolbar from "./components/ProductListToolbar";
import { sigIsLoading } from "./state";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";

import UserGuideTemplate from "./components/UserGuideTemplate";
import { JSX } from "preact/jsx-runtime";
import CsMessageComposer from "./components/CsMessageComposer";

import "./app.scss";
import Chat from "./components/chat/Chat";
import UserSettings from "./components/UserSettings";

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

type View = [string, string, () => JSX.Element];

const VIEWS: View[] = [
  ["/", "Inventory", Inventory],
  ["cs", "CS Message Composer", CsMessageComposer],
  ["chat", "Chat", Chat],
  ["/templates/userguide", "User Guide Template", UserGuideTemplate],
  ["/settings", "Settings", UserSettings],
];

const WithNavbar = ({ Component }: { Component: () => JSX.Element }) => {
  const navigate = useNavigate();
  return (
    <>
      <div className="navbar">
        {VIEWS.map(([path, name]) => (
          <label
            key={name}
            onClick={() => {
              navigate(path);
            }}
          >
            {name}
          </label>
        ))}
      </div>
      <Component />
    </>
  );
};

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/" replace />} />
      {VIEWS.map(([path, _, Component]) => (
        <Route path={path} element={<WithNavbar Component={Component} />} />
      ))}
    </Routes>
  );
};

export const App = () => {
  return (
    <ChakraProvider>
      <BrowserRouter>
        <AllRoutes />
      </BrowserRouter>
    </ChakraProvider>
  );
};
