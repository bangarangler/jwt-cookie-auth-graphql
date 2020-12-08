const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Tokens {
    accessToken: String
    refreshToken: String
  }

  type User {
    id: String
    email: String
    username: String
  }

  type Query {
    loggedInUser: User
  }

  type Mutation {
    login(username: String, password: String!): Tokens
  }
`;
