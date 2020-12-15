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
import { COOKIE_NAME, __prod_cors__, __prod__ } from "./constants";
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
          maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
          // maxAge: 10000, // 10 years
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
      // context: async ({ req, res, connection, redis }: ServerContext) => {
      context: async ({ req, res, connection, redis }: ServerContext) => {
        // const userId = req?.session?.userId || "";
        // console.log("userId", userId);
        // const accessToken = req.get("Authorization") || "";
        // console.log("accessToken", accessToken);
        // const userId = getUser(accessToken);
        // Is it a WS connection?
        // if (connection) {
        //   console.log("connection from context", connection);
        //   // console.log("connection.context", connection.context);
        //   //   console.log("connection", connection);
        //   // Are you logged in if you are your id is in context?
        //   // if (!connection.context.id) {
        //   //   throw new ApolloError("Not Authenticated");
        //   // }
        //   // your good get it out of context
        //   connection.pubsub = pubsub;
        //   return { connection };
        // }
        // otherwise not a WS so just pass pubsub to context
        // return { req, res, db, pubsub };
        return { req, res, db, redis, pubsub, connection };
      },
      subscriptions: {
        // onConnect: (_, ws: any) => {
        onConnect: (cParams: any, __) => {
          // console.log("cParams", cParams.accessToken);
          const accessToken = cParams.accessToken;
          console.log("accessToken", accessToken);
          const user = validateAccessToken(accessToken);
          if (!user) {
            throw new Error("Not Authed");
          }
          console.log("userId from onConnect", user.userId);
          return user.userId;
          // const accessToken = cParams.cParams;
          // console.log("accessToken", accessToken);
          // console.log("ws", ws.upgradedReq);
          // return new Promise((res: any) => {
          // console.log("res.upgradedReq", res.upgradedReq);
          // console.log("res", res.upgradedReq);
          // res({ req: ws.upgradedReq });
          // });
        },
        // onConnect: (_, ws: any, __) => {
        // onConnect: (connectionParams: any) => {
        //   console.log("connectionParams", connectionParams);
        //   if (connectionParams.authToken) {
        //     console.log(
        //       "connectionParams.authToken",
        //       connectionParams.authToken
        //     );
        //   }
        //     const userId = ws.upgradedReq;
        //     console.log("userId from subscriptions", userId);
        // return userId
        // get cookies
        // const tokenStr = ws.upgradeReq.headers.cookie;
        // console.log("tokenStr", tokenStr);
        // are there cookies in req?
        // if (tokenStr) {
        // seperate access= and refresh= from actual cookie value
        // const accessToken = tokenStr.split(";")[0].split("=")[1];
        // const refreshToken = tokenStr.split(";")[1].split("=")[1];
        // verify the user
        // const decodedAccessToken = validateAccessToken(accessToken);
        // const decodedRefreshToken = validateRefreshToken(refreshToken);
        // cookie valid?
        // if (!decodedAccessToken || !decodedAccessToken.user) {
        //       throw new ApolloError("Not Authenticated");
        //     } else if (!decodedRefreshToken || !decodedRefreshToken.user) {
        //       throw new ApolloError("Not Authenticated");
        //     } else {
        //       // return id in context so we can check for it below
        //       return decodedAccessToken.user;
        //     }
        //   }
        // },
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
