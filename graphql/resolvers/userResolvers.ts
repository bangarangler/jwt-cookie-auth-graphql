import { ObjectID } from "mongodb";
import bcrypt from "bcryptjs";
import {
  MutationResolvers,
  QueryResolvers,
  Tokens,
  User,
} from "../../codeGenBE";
import { setTokens } from "../../auth/authTokens";

interface Resolvers {
  Query: QueryResolvers;
  Mutation: MutationResolvers;
}

// interface RegisterInputs {
//   username: string;
//   password: string;
//   confirmPW: string;
// }

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
  },
  Mutation: {
    login: async (
      _,
      { username, password },
      { db },
      ___
    ): Promise<Tokens | null> => {
      try {
        if (!username || !password) return null;
        const user = await db
          .db("jwtCookie")
          .collection("users")
          .findOne({ username });
        if (!user) return null;

        // check passwords match
        const correctPW = password.toString().trim();
        const validPw = await bcrypt.compare(correctPW, user.password);
        // if no match return null
        if (!validPw) return null;
        const tokenVersion = user.tokenVersion;
        console.log("tokenVersion", tokenVersion);

        // if passwords do match generate a token
        const { accessToken, refreshToken } = await setTokens(user);

        // return token
        return { accessToken, refreshToken };
      } catch (err) {
        console.log("err", err);
        return null;
      }
    },
    register: async (
      _,
      { username, password, confirmPW },
      { db },
      ___
    ): Promise<Tokens | null> => {
      // const { username, password, confirmPW } = context;
      try {
        if (!username || !password || !confirmPW) {
          console.log("no info provided");
          return null;
        }
        if (password.toString().trim() !== confirmPW.toString().trim()) {
          console.log("pw don't match");
          return null;
        }
        const hashedPW = await bcrypt.hash(password, 12);
        const newUser = { username, password: hashedPW, tokenVersion: 0 };
        const foundUser = await db
          .db("jwtCookie")
          .collection("users")
          .findOne({ username });
        if (foundUser) return null;
        const user = await db
          .db("jwtCookie")
          .collection("users")
          .insertOne(newUser);

        if (!user) return null;
        const { accessToken, refreshToken } = await setTokens(user);
        return { accessToken, refreshToken };
      } catch (err) {
        console.log("err from register", err);
        return null;
      }
    },
  },
};
