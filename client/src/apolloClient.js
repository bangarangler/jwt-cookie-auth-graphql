import {
  InMemoryCache,
  HttpLink,
  ApolloLink,
  ApolloClient,
} from "@apollo/client";
import { useAuthToken } from "./authToken";
const httpLink = new HttpLink({ uri: "http://localhost:4000/graphql" });

const authMiddleware = (authToken) =>
  new ApolloLink((operation, forward) => {
    // add the authorization to the headers
    console.log("authToken", authToken);
    if (authToken) {
      operation.setContext({
        headers: {
          bearer: authToken,
        },
      });
    } else {
      // do stuff here
    }

    console.log("operation", operation);
    return forward(operation);
  });

const cache = new InMemoryCache({});

export const useApolloClient = () => {
  const [authToken] = useAuthToken();
  return new ApolloClient({
    link: authMiddleware(authToken).concat(httpLink),
    cache,
  });
};
