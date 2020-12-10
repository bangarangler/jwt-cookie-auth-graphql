import dotenv from "dotenv-safe";
dotenv.config();
import { ApolloError, ApolloServer } from "apollo-server-express";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as mongodb from "mongodb";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import Redis from "ioredis";
import { RedisPubSub } from "graphql-redis-subscriptions";
// GENERATED / IMPORTS
import { __prod_cors__ } from "./constants";
import { typeDefs } from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";
import { ServerContext } from "./ServerContext";
import { validateTokensMiddleware } from "./middleware/validateTokensMiddleware";
import {
  validateAccessToken,
  validateRefreshToken,
} from "./auth/validateTokens";

const { MongoClient } = mongodb;

const main = async () => {
  try {
    let db: any;
    const database = await MongoClient.connect(`${process.env.MONGO_STRING}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    if (!database) throw new Error("Mongo not connected!");
    db = database;

    const redisOptions = {
      host: process.env.REDIS_DOMAIN_NAME || "127.0.0.1",
      port: process.env.REDIS_PORT || "6379",
      retryStrategy: (times: any) => {
        return Math.min(times * 50, 2000);
      },
    };

    const pubsub = new RedisPubSub({
      publisher: new Redis(redisOptions as any),
      subscriber: new Redis(redisOptions as any),
    });

    const app = express();
    const corsConfig = __prod_cors__;
    // app.use(cors());
    app.use(cors(corsConfig));
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use((req, res, next) => validateTokensMiddleware(req, res, next, db));

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      playground: {
        endpoint: "/graphql",
        settings: {
          "request.credentials": "include",
        },
      },
      subscriptions: {
        onConnect: (_, ws: any, __) => {
          // get cookies
          const tokenStr = ws.upgradeReq.headers.cookie;
          // are there cookies in req?
          if (tokenStr) {
            // seperate access= and refresh= from actual cookie value
            const accessToken = tokenStr.split(";")[0].split("=")[1];
            const refreshToken = tokenStr.split(";")[1].split("=")[1];
            // verify the user
            const decodedAccessToken = validateAccessToken(accessToken);
            const decodedRefreshToken = validateRefreshToken(refreshToken);
            // cookie valid?
            if (!decodedAccessToken || !decodedAccessToken.user) {
              throw new ApolloError("Not Authenticated");
            } else if (!decodedRefreshToken || !decodedRefreshToken.user) {
              throw new ApolloError("Not Authenticated");
            } else {
              // return id in context so we can check for it below
              return decodedAccessToken.user;
            }
          }
        },
      },
      context: async ({ req, res, connection }: ServerContext) => {
        // Is it a WS connection?
        if (connection) {
          // Are you logged in if you are your id is in context?
          if (!connection.context.id) {
            throw new ApolloError("Not Authenticated");
          }
          // your good get it out of context
          connection.pubsub = pubsub;
          return { connection };
        }
        // otherwise not a WS so just pass pubsub to context
        return { req, res, db, pubsub };
      },
    });

    server.applyMiddleware({ app, cors: false });

    const httpServer = createServer(app);
    server.installSubscriptionHandlers(httpServer);

    try {
      const port = process.env.PORT;
      httpServer.listen(port, () => {
        console.log(
          `Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`
        );
        console.log(
          `Subscription ready at ws://localhost:${process.env.PORT}${server.subscriptionsPath}`
        );
      });
    } catch (err) {
      console.log("err from httpServerr connection", err);
    }
    // app.listen({ port: process.env.PORT }, () => {
    //   console.log(
    //     `Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`
    //   );
    // });
  } catch (err) {
    console.log("hold up main is busted");
  }
};

main();
