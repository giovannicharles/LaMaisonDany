import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { setupPwa } from "./lib/pwa";
import { recoverFromStaleBuild } from "./lib/lazyRetry";

setupPwa();
window.addEventListener("vite:preloadError", () => void recoverFromStaleBuild());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
