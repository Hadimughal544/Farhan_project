import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#ffffff",
              color: "#0f172a",
              border: "1px solid #e2e8f0",
              boxShadow: "0 12px 32px rgba(15, 23, 42, 0.10)",
              borderRadius: "12px",
              padding: "12px 14px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#0f172a", secondary: "#ffffff" } },
            error: { iconTheme: { primary: "#b91c1c", secondary: "#ffffff" } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
