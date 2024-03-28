import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import AppProvider from "./AppContext.tsx";
import { WalletContextProvider } from "./providers/WalletProvider/WalletProvider.tsx";
import { GasContextProvider } from "./providers/GasProvider/index.tsx";
import { TokenStoreContextProvider } from "./providers/TokenStoreProvider/index.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <WalletContextProvider>
          <TokenStoreContextProvider>
            <GasContextProvider>
              <App />
            </GasContextProvider>
          </TokenStoreContextProvider>
      </WalletContextProvider>
    </AppProvider>
  </React.StrictMode>
);
