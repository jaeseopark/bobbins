import { SmallAddIcon } from "@chakra-ui/icons";
import { Button, ChakraProvider, Heading, Spacer, Spinner } from "@chakra-ui/react";
import { JSX } from "preact/jsx-runtime";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { addTestProduct, sigIsLoading } from "./state";

import Chat from "./components/Chat";
import ConversionsWithPopover from "./components/ConversionsWithPopover";
import CsMessageComposer from "./components/CsMessageComposer";
import ProductGridView from "./components/ProductGridView";
import UserGuideTemplate from "./components/UserGuideTemplate";
import UserSettings from "./components/UserSettings";

import "./app.scss";

const Inventory = () => {
  if (sigIsLoading.value) {
    return <Spinner />;
  }

  return (
    <div className="inventory">
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
    <div className="bobbins-padded-view">
      <div className="bobbins-navbar">
        <Heading>Bobbins</Heading>
        <Spacer />
        {VIEWS.filter(({ state }) => state === "ACTIVE").map(({ path, name }) => (
          <Heading
            size="md"
            className="path"
            key={name}
            onClick={() => {
              navigate(path);
            }}
          >
            {name}
          </Heading>
        ))}
        <Spacer />
        <ConversionsWithPopover buttonSize="sm" />
        <Button onClick={addTestProduct} size="sm" leftIcon={<SmallAddIcon />}>
          Product
        </Button>
      </div>
      <div className="bobbins-content">
        <Component />
      </div>
    </div>
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
