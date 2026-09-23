import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./app/App.tsx";

import "./shared/styles/global.scss";
const a = {
  manifest: "mhxy-cbg-services",
  type: "success",
  params: {},
};
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
