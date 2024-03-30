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

type View = {
  path: string;
  name: string;
  component: () => JSX.Element;
  state: "ACTIVE" | "HIDDEN";
};

const VIEWS: View[] = [
  { path: "/", name: "Inventory", component: Inventory, state: "ACTIVE" },
  { path: "/cs", name: "CS Message Composer", component: CsMessageComposer, state: "HIDDEN" },
  { path: "/chat", name: "Chat", component: Chat, state: "ACTIVE" },
  { path: "/templates/userguide", name: "User Guide Template", component: UserGuideTemplate, state: "HIDDEN" },
  { path: "/settings", name: "Settings", component: UserSettings, state: "ACTIVE" },
];

const WithNavbar = ({ Component }: { Component: () => JSX.Element }) => {
  const navigate = useNavigate();
  return (
    <>
      <div className="navbar">
        {VIEWS.filter(({ state }) => state === "ACTIVE").map(({ path, name }) => (
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

export const App = () => {
  return (
    <ChakraProvider>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Navigate to="/" replace />} />
          {VIEWS.map(({ path, component: Component }) => (
            <Route path={path} element={<WithNavbar Component={Component} />} />
          ))}
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
};
