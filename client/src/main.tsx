// client/src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import { ToastProvider } from "./components/common/ToastProvider";
import './index.css';
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <ToastProvider />
  </React.StrictMode>
);