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
// import { useMeLazyQuery } from "./codeGenFE";

// let token: any = "";

// async function fetchToken() {
//   console.log("step: fetch tokens running");
//   const res = await axios({
//     url: "http://localhost:4000/graphql",
//     method: "post",
//     data: {
//       query: `
//       query GetToken{
//         getToken{
//           accessToken
//           error {
//             message
//           }
//         }
//       }
//       `,
//     },
//     withCredentials: true,
//   });
//   return res;
// }

// This sets the headers for every request to the server
// const snagNewTokens = new ApolloLink((operation, forward) => {
//   console.log("step: snag new token running");
//   if (token) {
//     operation.setContext(({ headers = {} }) => ({
//       headers: {
//         ...headers,
//         bearer: token,
//       },
//     }));
//     console.log("token", token);
//   }
//   return forward(operation).map((res) => res);
//   // return forward(operation).map((response: any) => {
//   //   const context = operation.getContext();
//   //   const {
//   //     response: { headers },
//   //   } = context;
//   //   // if fresh access token is sent, set it to the header
//   //   if (headers && headers?.get("bearer")?.length > 0) {
//   //     token = headers.get("bearer");
//   //     console.log("token", token);
//   //     // console.log("token :>> ", token);
//   //   }
//   //   return response;
//   // });
// });
// // })

// const resetToken = onError(({ networkError }) => {
// const resetToken = onError(
//   ({ networkError, response, operation, forward }: ErrorResponse) => {
//     console.log("step: reset token running");
//     // console.log("Error Middleware hit");
//     if (
//       networkError &&
//       "statusCode" in networkError &&
//       networkError.statusCode === 401
//     ) {
//       // if we get a 401, assume the access token is bad and try to fetch a fresh one
//       fetchToken().then((tokenRes) => {
//         console.log("tokenRes :>> ", tokenRes);
//         if (tokenRes?.data?.data?.getToken?.accessToken) {
//           // set token to header
//           token = tokenRes.data.data.getToken.accessToken;
//           if (token) {
//             operation.setContext(({ headers = {} }) => ({
//               headers: {
//                 ...headers,
//                 bearer: token,
//               },
//             }));
//             console.log("token", token);
//             return forward(operation);
//           }
//         }
//       });
//     }
//   }
// );

// retry when we get a 401 after we set a new access token to the header (above)
// const retryRequest = new RetryLink({
//   attempts: async (count, operation, error) => {
//     if (error?.statusCode === 401 && count < 2) {
//       return true;
//     }
//     return false;
//   },
//   delay: (count, operation, error) => {
//     return count * 1000 * Math.random();
//   },
// });

// concat order 1 => 3 => 2
// const authFlowLink = retryRequest.concat(snagNewTokens).concat(resetToken);
// const authFlowLink = retryRequest.concat(resetToken).concat(snagNewTokens);
// const authFlowLink = snagNewTokens.concat(retryRequest).concat(resetToken);
// const authFlowLink = snagNewTokens.concat(resetToken).concat(retryRequest);
// const authFlowLink = resetToken.concat(snagNewTokens).concat(retryRequest);
// const authFlowLink = resetToken.concat(retryRequest).concat(snagNewTokens);

// const resetToken = onError(({ networkError }) => {
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
      // window.location.href = "http://localhost:3000/login";
      // if we get a 401, assume the access token is bad and try to fetch a fresh one
      // fetchToken().then((tokenRes) => {
      //   console.log("tokenRes :>> ", tokenRes);
      //   if (tokenRes?.data?.data?.getToken?.accessToken) {
      //     // set token to header
      //     token = tokenRes.data.data.getToken.accessToken;
      //     if (token) {
      //       operation.setContext(({ headers = {} }) => ({
      //         headers: {
      //           ...headers,
      //           bearer: token,
      //         },
      //       }));
      //       console.log("token", token);
      //       return forward(operation);
      //     }
      //   }
      // });
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
