import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import {
  ApolloClient,
  ApolloProvider,
  // createHttpLink,
  InMemoryCache,
} from "@apollo/client";
// import { setContext } from "@apollo/client/link/context";
import "./index.css";
import App from "./App";
// import { getTokens, saveTokens } from "./utilsFE/tempToken";

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
  // link: authLink.concat(httpLink),
  uri: "http://localhost:4000/graphql",
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
