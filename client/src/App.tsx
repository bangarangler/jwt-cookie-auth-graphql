import React, { FC } from "react";
import { ContextProvider } from "./context/providerComposer";
// COMPONENTS
import NavBar from "./components/NavBar";
import AuthGate from "./AuthGate";
import { ApolloProvider } from "@apollo/client";
import { useApolloClient } from "./apolloClient";

import "./App.css";

interface AppProps {}

const App: FC<AppProps> = () => {
  const apolloClient = useApolloClient();
  return (
    <ApolloProvider client={apolloClient}>
      <ContextProvider>
        <div className="App">
          <NavBar />
          <AuthGate />
        </div>
      </ContextProvider>
    </ApolloProvider>
  );
};

export default App;
