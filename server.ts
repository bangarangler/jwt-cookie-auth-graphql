import dotenv from "dotenv-safe";
dotenv.config();
import { ApolloServer } from "apollo-server-express";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as mongodb from "mongodb";
import cookieParser from "cookie-parser";
import { createServer } from "http";
// import { verify } from "jsonwebtoken";
import Redis from "ioredis";
import { RedisPubSub } from "graphql-redis-subscriptions";
import session from "express-session";
import connectRedis from "connect-redis";
// import { applyMiddleware } from "graphql-middleware";
// import { permissions } from "./permissions";
// import { makeExecutableSchema } from "graphql-tools";
// GENERATED / IMPORTS
import {
  COOKIE_JWT_REFRESH_TIME,
  COOKIE_NAME,
  __prod_cors__,
  __prod__,
} from "./constants";
import { typeDefs } from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";
import { ServerContext } from "./ServerContext";
import { validateTokensMiddleware } from "./middleware/validateTokensMiddleware";
import {
  validateAccessToken,
  // validateRefreshToken,
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
      host: process.env.REDIS_HOST || "127.0.0.1",
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
    // TEST NEW STUFF
    const RedisStore = connectRedis(session);

    const redis = new Redis(process.env.REDIS_PORT);
    if (!redis) throw new Error("Redis Not Connected");
    // app.set("trust proxy", 1)
    const corsConfig = __prod_cors__;
    // app.use(cors());
    app.use(cors(corsConfig));
    app.use(
      session({
        name: COOKIE_NAME,
        store: new RedisStore({ client: redis, disableTouch: true }),
        cookie: {
          // maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
          // maxAge: 90000, // 30 sec
          // maxAge: 5000,
          // maxAge: 5000,
          maxAge: COOKIE_JWT_REFRESH_TIME,
          httpOnly: __prod__,
          sameSite: "lax",
          secure: __prod__, // cookie only works in https
          domain: __prod__ ? "domain here" : undefined,
        },
        saveUninitialized: false,
        secret: process.env.REDIS_SECRET!,
        resave: false,
      })
    );
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
      context: async ({ req, res, connection, redis }: ServerContext) => {
        if (connection) {
          connection.pubsub = pubsub;
          return { connection };
        }
        return { req, res, db, redis, pubsub };
      },
      subscriptions: {
        onConnect: (cParams: any, __) => {
          const accessToken = cParams.accessToken;
          const user = validateAccessToken(accessToken);
          if (!user) {
            throw new Error("Not Authed");
          }
          return { userId: user.userId };
        },
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
  } catch (err) {
    console.log("hold up main is busted");
  }
};

main();
