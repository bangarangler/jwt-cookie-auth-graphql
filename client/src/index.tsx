import React, { forwardRef } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ErrorResponse, onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import "./index.css";
import App from "./App";
import axios from "axios";
import { buildOperationNodeForField } from "graphql-tools";
import { toEditorSettings } from "typescript";

const errorChecker = onError(
  ({ networkError, response, operation, forward }: ErrorResponse) => {
    console.log("ErrorChecker Running");
    // console.log("Error Middleware hit");
    if (
      networkError &&
      "statusCode" in networkError &&
      networkError.statusCode === 401
    ) {
      console.log("GOT A 401");
      window.location.href = "http://localhost:3000/login";
    }
  }
);

// const authFlowLink = errorChecker;

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
  credentials: "include",
});

const client = new ApolloClient({
  link: errorChecker.concat(httpLink),
  cache: new InMemoryCache(),
  credentials: "include",
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <React.StrictMode>
      <Router>
        <App />
      </Router>
    </React.StrictMode>
  </ApolloProvider>,
  document.getElementById("root")
);
