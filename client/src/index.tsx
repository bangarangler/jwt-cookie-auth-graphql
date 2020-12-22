import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import {
  ApolloClient,
  ApolloProvider,
  ApolloLink,
  HttpLink,
  // createHttpLink,
  InMemoryCache,
} from "@apollo/client";
// import { setContext } from "@apollo/client/link/context";
import "./index.css";
import App from "./App";
import axios from "axios";
import { response } from "express";
import { GetTokenDocument } from "./codeGenFE";
// import { getTokens, saveTokens } from "./utilsFE/tempToken";

async function start() {
  let bearer: any = "";

  const fetchTokenRes = await axios({
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
  console.log("fetchTokenRes :>> ", fetchTokenRes);
  if (fetchTokenRes?.headers?.bearer) {
    bearer = fetchTokenRes.headers.bearer;
  }

  const authMiddleware = new ApolloLink((operation, forward) => {
    // add the authorization to the headers
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        bearer: bearer, // add in auth from bearer
      },
    }));

    return forward(operation).map((res) => {
      // check if this is a registration call
      if (
        res?.data?.register?.accessToken &&
        res.data.register.accessToken.length > 0
      ) {
        bearer = res?.data?.register?.accessToken;
      }
      // check if this is a login call
      if (
        res?.data?.login?.accessToken &&
        res.data.login.accessToken.length > 0
      ) {
        bearer = res.data.login.accessToken;
      }
      return res;
    });
  });

  const laterMiddleWare = new ApolloLink((operation, forward) => {
    // console.log("running later Middleware");
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        bearer: bearer, // add in auth from bearer
      },
    }));

    return forward(operation).map((response) => {
      const context = operation.getContext();
      const {
        response: { headers },
      } = context;
      // if fresh access token is sent, set it to the header
      if (headers && headers?.get("bearer")?.length > 0) {
        bearer = headers.get("bearer");
      }
      return response;
    });
  });

  const httpLink = new HttpLink({
    uri: "http://localhost:4000/graphql",
    credentials: "include",
  });

  const client = new ApolloClient({
    // not needed if doing with cookies
    // link: authLink.concat(httpLink),
    // link: authMiddleware.concat(httpLink),
    // link: from([authMiddleware, laterMiddleWare, httpLink]),
    link: authMiddleware.concat(laterMiddleWare).concat(httpLink),
    // uri: "http://localhost:4000/graphql",
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

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
}

start();
