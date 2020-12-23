import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import "./index.css";
import App from "./App";
import axios from "axios";

let token: any = "";

const withToken = setContext(async () => {
  // if we have it cached return it
  if (token) return { token };

  const fetchTokenRes = async () => {
    return await axios({
      url: "http://localhost:4000/graphql",
      method: "post",
      data: {
        query: `
        query GetToken{
          getToken{
            accessToken
            error {
              message
            }
          }
        }
      `,
      },
      withCredentials: true,
    });
  };
  try {
    const tokenFromBE = await fetchTokenRes();
    console.log("tokenFromBE", tokenFromBE);
    if (tokenFromBE?.headers?.bearer) {
      token = tokenFromBE.data.data.getToken.accessToken;
      console.log("token", token);
    }
  } catch (err) {
    console.log("err", err);
  }
  if (token) return { token };
});

const resetToken = onError(({ networkError }) => {
  if (
    // networkError && networkError.name === "ServerError" && networkError.statusCode === 401
    networkError &&
    networkError.name === "ServerError"
  ) {
    token = null;
  }
});

const authFlowLink = withToken.concat(resetToken);

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
  credentials: "include",
});

const client = new ApolloClient({
  link: authFlowLink.concat(httpLink),
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
