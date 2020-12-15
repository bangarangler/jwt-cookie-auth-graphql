import { ObjectID } from "mongodb";
import bcrypt from "bcryptjs";
import { verify } from "jsonwebtoken";
import {
  LoginResponse,
  MutationResolvers,
  QueryResolvers,
  RegisterResponse,
  SubscriptionResolvers,
  // Result,
  // Tokens,
  User,
} from "../../codeGenBE";
import { setTokenCookies, setTokens } from "../../auth/authTokens";
// import { setTokens } from "../../auth/authTokens";
import { loginValidation } from "../../utils/loginValidation";
import { registerValidation } from "../../utils/registerValidation";
import { COOKIE_NAME } from "../../constants";

interface Resolvers {
  Query: QueryResolvers;
  Mutation: MutationResolvers;
  Subscription: SubscriptionResolvers;
}

const SOMETHING_CHANGED = "something_changed";

export const userResolvers: Resolvers = {
  Query: {
    loggedInUser: async (_, __, { req, db }): Promise<User | null> => {
      if (!req.user) {
        return null;
      }
      const foundUser = await db
        .db("jwtCookie")
        .collection("users")
        .findOne({ _id: new ObjectID(req.user.id) });
      return foundUser;
    },
    // me: async (_, __, { req, db, pubsub }): Promise<User | null> => {
    me: async (_, __, { req, db, pubsub }): Promise<User | null> => {
      const accessToken = req.headers["bearer"];
      if (req.session.userId) {
        const sessionUser = req.session.userId;
        console.log("sessionUser", sessionUser);
      }
      if (req.session.refresh) {
        const refreshToken = req.session.refresh;
        console.log("refreshToken", refreshToken);
      }
      if (!accessToken) return null;
      const validateAccessToken = (token: string): null | any => {
        try {
          return verify(token, process.env.ACCESS_TOKEN!);
        } catch (err) {
          console.log("err", err);
          return null;
        }
      };
      const validUser = validateAccessToken(accessToken);
      // console.log({ validUser });
      const user = await db
        .db("jwtCookie")
        .collection("users")
        .findOne({ _id: new ObjectID(validUser.userId) });
      console.log("user HERE", user);
      pubsub.publish(SOMETHING_CHANGED, {
        somethingChanged: "Hey here is the me response",
      });
      return user;
    },
  },
  Mutation: {
    login: async (_, { input }, { db, req }, ___): Promise<LoginResponse> => {
      try {
        const { username, password } = input;
        const isValidLogin = loginValidation(username, password);
        if (isValidLogin.length > 0) return { errors: isValidLogin };
        const user = await db
          .db("jwtCookie")
          .collection("users")
          .findOne({ username });
        if (!user) return { error: { message: "No user with that username" } };

        // check passwords match
        // const correctPW = password.toString().trim();
        const validPw = await bcrypt.compare(password, user.password);
        if (!validPw) return { error: { message: "Invalid Credentials" } };
        const tokenVersion = user.tokenVersion;
        // do something with tokenVersion
        console.log("tokenVersion", tokenVersion);

        // if passwords do match generate a token
        const { accessToken, refreshToken } = setTokens(user);
        const cookies = setTokenCookies({ accessToken, refreshToken });
        // req.session.refresh = cookies.refresh;
        req.session.refresh = cookies.refresh[1];
        // console.log("user from login", user);
        req.session.userId = user._id;

        // return token
        // console.log("user res", user);
        return { user, accessToken };
      } catch (err) {
        console.log("err", err);
        return { error: { message: "Something went wrong Internally" } };
      }
    },
    register: async (
      _,
      { input },
      { db, req },
      ___
    ): Promise<RegisterResponse> => {
      try {
        const { username, password, confirmPassword } = input;
        const errors = registerValidation(username, password, confirmPassword);
        if (errors.length > 0) return { errors };
        const hashedPW = await bcrypt.hash(password, 12);
        const newUser = { username, password: hashedPW, tokenVersion: 0 };
        const foundUser = await db
          .db("jwtCookie")
          .collection("users")
          .findOne({ username });
        if (foundUser) return { error: { message: "User Already Exists" } };
        const user = await db
          .db("jwtCookie")
          .collection("users")
          .insertOne(newUser);

        // console.log("user", user);
        if (!user)
          return { error: { message: "Could not add user at this time" } };
        const { accessToken, refreshToken } = setTokens(user.ops[0]);
        const cookies = setTokenCookies({ accessToken, refreshToken });
        req.session.refresh = cookies.refresh[1];
        req.session.userId = user.ops[0]._id;
        // console.log("cookies.refresh", cookies.refresh);
        // console.log("session from register", req.session);
        return { user: user.ops[0], accessToken };
      } catch (err) {
        console.log("err from register", err);
        const error = {
          message: "Something went wrong internally registering",
        };
        return { error };
      }
    },
    logout: async (_, __, { res, req }, ____) => {
      res.clearCookie(COOKIE_NAME);
      req.session.destroy;
      return true;
    },
  },
  Subscription: {
    somethingChanged: {
      subscribe: (_, __, { connection }) => {
        // console.log("connection from subscription", connection.context);
        if (!connection.context.req.session.userId) {
          // console.log("no user!!!!!! NOPE NOPE NOPE");
        }
        // console.log("connection", connection);
        // console.log("connection", connection);
        // console.log("pubsub", connection.pubsub);
        return connection.pubsub.asyncIterator(SOMETHING_CHANGED);
      },
    },
  },
};
