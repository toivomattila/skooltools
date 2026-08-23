import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ConvexApp from "./ConvexApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexApp />
  </StrictMode>,
);
