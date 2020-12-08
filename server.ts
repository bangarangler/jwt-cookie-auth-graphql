import dotenv from "dotenv-safe";
dotenv.config();
import { ApolloServer } from "apollo-server-express";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as mongodb from "mongodb";
import cookieParser from "cookie-parser";
// GENERATED / IMPORTS
import { typeDefs } from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";
import { ServerContext } from "./ServerContext";
import { validateTokensMiddleware } from "./middleware/validateTokensMiddleware";

const { MongoClient } = mongodb;

let db: any;
MongoClient.connect(
  `${process.env.MONGO_STRING}`,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err: any, database: any) => {
    if (err) {
      return console.error(err);
    }
    db = database;
  }
);

const app = express();
// const corsOptions = { origin: [], credentials: true };
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: {
    endpoint: "/graphql",
  },
  context: async ({ req, res }: ServerContext) => ({ req, res, db }),
});

app.use((req, res, next) => validateTokensMiddleware(req, res, next, db));
server.applyMiddleware({ app, cors: false });
app.listen({ port: process.env.PORT }, () => {
  console.log(
    `Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`
  );
});
