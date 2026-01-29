import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { installGlobalErrorHandlers } from "@/utils/logging";
import "@/styles/tokens.css";
import "@/styles/space.css";

installGlobalErrorHandlers();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>
);
