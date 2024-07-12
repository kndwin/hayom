import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app.tsx";

import { EvoluProvider } from "@evolu/react";
import { TooltipProvider } from "./shared/ui/tooltip";
import { evolu } from "./modules/todos/db.ts";

import "./main.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <EvoluProvider value={evolu}>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </EvoluProvider>
  </React.StrictMode>
);
