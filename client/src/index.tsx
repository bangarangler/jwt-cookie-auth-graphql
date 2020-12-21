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
      // authorization: localStorage.getItem('token') || null,
    },
  }));

  console.log({ operation });
  //   return forward(operation);
  return forward(operation).map((res) => {
    // console.log({ res });
    // console.log("headers???", operation.getContext().headers);
    if (operation.getContext().headers.bearer) {
      console.log(
        "operation.getContext()",
        operation.getContext().headers.bearer
      );
      bearer = operation.getContext().headers.bearer;
      console.log("bearer from getContext", bearer);
    }
    if (res?.data?.register?.accessToken) {
      bearer = res?.data?.register?.accessToken;
      console.log("bearer off register", bearer);
    }
    if (res?.data?.login?.accessToken) {
      bearer = res.data.login.accessToken;
      console.log("bearer off login", bearer);
    }
    console.log("res", res);
    // if (res?.headers?.bearer) {
    //   bearer = res?.headers?.bearer;
    // }
    // console.log("res", res);
    return res;
  });
});

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
  credentials: "include",
});

// OLD hard way with cookies does work
// const httpLink = createHttpLink({
//   uri: "http://localhost:4000/graphql",
//   fetch: async (uri, options) => {
//     const initReq = await fetch(uri, options);
//     const { headers } = initReq;
//     const accessToken = headers.get("x-access-token");
//     const refreshToken = headers.get("x-refresh-token");
//     if (accessToken && refreshToken) {
//       saveTokens({
//         accessToken,
//         refreshToken,
//       });
//     }
//     console.log({ initReq });
//     return initReq;
//   },
// });

// const authLink = setContext(async (_, { headers }) => {
//   const tokens = getTokens();
//   console.log({ tokens });
//   if (tokens && tokens.accessToken) {
//     return {
//       headers: {
//         "x-access-token": tokens.accessToken,
//         "x-refresh-token": tokens.refreshToken,
//       },
//     };
//   }
// });

const client = new ApolloClient({
  // not needed if doing with cookies
  // link: authLink.concat(httpLink),
  link: authMiddleware.concat(httpLink),
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
