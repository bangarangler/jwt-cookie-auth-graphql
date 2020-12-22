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
// import { getTokens, saveTokens } from "./utilsFE/tempToken";
let bearer = "";

const authMiddleware = new ApolloLink((operation, forward) => {
  console.log("auth middle ware hit...");
  // add the authorization to the headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      bearer: bearer, // add in auth from bearer
    },
  }));

  console.log({ operation });
  return forward(operation).map((res) => {
    console.log(
      "res.data.register.accessToken",
      res?.data?.register?.accessToken
    );
    if (
      res?.data?.register?.accessToken &&
      res.data.register.accessToken !== ""
    ) {
      console.log("if check have data.register.accessToken");
      bearer = res?.data?.register?.accessToken;
      console.log("bearer off register", bearer);
    }
    console.log("res.data.login.accessToken", res?.data?.login?.accessToken);
    if (res?.data?.login?.accessToken && res.data.login.accessToken !== "") {
      console.log("if check have data.login.accessToken");
      bearer = res.data.login.accessToken;
      console.log("bearer off login", bearer);
    }
    console.log("res", res);
    return res;
  });
});

const laterMiddleWare = new ApolloLink((operation, forward) => {
  console.log("running later Middleware");
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      bearer: bearer, // add in auth from bearer
    },
  }));

  return forward(operation).map((response) => {
    console.log("running getContext");
    const context = operation.getContext();
    const {
      response: { headers },
    } = context;
    console.log("headers", headers);
    if (headers && headers.get("bearer") !== "") {
      bearer = headers.get("bearer");
      console.log("bearer from getContext", bearer);
      console.log("headers.get('bearer')", headers.get("bearer"));
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
