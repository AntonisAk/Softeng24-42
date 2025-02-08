import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./variables.css"; // Global CSS variables
import "./global.css"; // Global styles

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
