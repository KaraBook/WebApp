import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { Toaster } from "sonner"; 
import "sonner/dist/sonner.css"; 

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/owner">
      <AuthProvider>
        <App />
        <Toaster
          position="top-center"  
          richColors              
          closeButton             
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
