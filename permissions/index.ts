import { shield, allow } from "graphql-shield";
import * as rules from "./authRules";

export const permissions = shield({
  Query: {
    me: rules.isAuthenticated,
    loggedInUser: rules.isAuthenticated,
  },
  Mutation: {
    "*": rules.isAuthenticated,
    login: allow,
    register: allow,
  },
});
