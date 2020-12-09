import { ObjectID } from "mongodb";
import bcrypt from "bcryptjs";
import {
  LoginResponse,
  MutationResolvers,
  QueryResolvers,
  RegisterResponse,
  // Tokens,
  User,
} from "../../codeGenBE";
import { setTokenCookies, setTokens } from "../../auth/authTokens";
import { loginValidation } from "../../utils/loginValidation";
import { registerValidation } from "../../utils/registerValidation";

interface Resolvers {
  Query: QueryResolvers;
  Mutation: MutationResolvers;
}

export const userResolvers: Resolvers = {
  Query: {
    loggedInUser: async (_, __, { req, db }): Promise<User | null> => {
      // console.log({ req });
      if (!req.user) {
        console.log("req.user", req.user);
        return null;
      }
      console.log("req.user", req.user);
      const foundUser = await db
        .db("jwtCookie")
        .collection("users")
        .findOne({ _id: new ObjectID(req.user.id) });
      console.log("foundUser", foundUser);
      return foundUser;
    },
    me: async (_, __, { req, db }): Promise<User | null> => {
      console.log("req", req.user);
      // const accessToken = req.headers["x-access-token"]
      // const refreshToken = req.headers["x-refresh-token"]
      // if (!accessToken && !refreshToken) return null;
      if (!req.user) return null;
      const user = await db
        .db("jwtCookie")
        .collection("users")
        .findOne({ _id: new ObjectID(req.user.id) });
      console.log("user", user);
      return user;
    },
  },
  Mutation: {
    login: async (_, { input }, { db, res }, ___): Promise<LoginResponse> => {
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
        const { accessToken, refreshToken } = await setTokens(user);
        const cookies = setTokenCookies({ accessToken, refreshToken });
        res.cookie(...cookies.access);
        res.cookie(...cookies.refresh);

        // return token
        console.log("user res", user);
        return { user };
      } catch (err) {
        console.log("err", err);
        return { error: { message: "Something went wrong Internally" } };
      }
    },
    register: async (_, { input }, { db }, ___): Promise<RegisterResponse> => {
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

        if (!user)
          return { error: { message: "Could not add user at this time" } };
        const { accessToken, refreshToken } = await setTokens(user);
        const tokenVersion = user.ops[0].tokenVersion;
        console.log({ tokenVersion });
        console.log({ foundUser });
        return { tokens: { accessToken, refreshToken } };
      } catch (err) {
        console.log("err from register", err);
        const error = {
          message: "Something went wrong internally registering",
        };
        return { error };
      }
    },
    logout: async (_, __, { res }, ____) => {
      res.clearCookie("access");
      res.clearCookie("refresh");
      return true;
    },
  },
};
