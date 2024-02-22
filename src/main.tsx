import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import AppProvider from "./AppContext.tsx";
import { WalletContextProvider } from "./providers/WalletProvider/WalletProvider.tsx";
import { GasContextProvider } from "./providers/GasProvider/index.tsx";
import { ActivityHandlerContextProvider } from "./providers/ActivityHandlerProvider/index.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <ActivityHandlerContextProvider>
        <WalletContextProvider>
          <GasContextProvider>
            <App />
          </GasContextProvider>
        </WalletContextProvider>
      </ActivityHandlerContextProvider>
    </AppProvider>
  </React.StrictMode>
);
