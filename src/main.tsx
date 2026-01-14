import { Provider } from "@react-spectrum/s2";
import "@react-spectrum/s2/page.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider background="base">
      <App />
    </Provider>
  </StrictMode>
);
