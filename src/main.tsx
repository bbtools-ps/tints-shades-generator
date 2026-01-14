import { Provider } from "@react-spectrum/s2";
import "@react-spectrum/s2/page.css";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider
      background="base"
      styles={style({
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      })}
    >
      <App />
    </Provider>
  </StrictMode>
);
