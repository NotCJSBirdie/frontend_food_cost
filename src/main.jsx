import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Optionally console.log any public environment variables for debug:
console.log("Environment variables:", import.meta.env);

// No Apollo Client, API configs, or GraphQL dependencies needed now!

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
