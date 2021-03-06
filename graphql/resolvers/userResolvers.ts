import { ObjectID } from "mongodb";
import bcrypt from "bcryptjs";
import { verify, sign } from "jsonwebtoken";
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
import { sendEmail } from "../../utils/sendEmail";

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
      if (req?.session?.userId) {
        const sessionUser = req.session.userId;
        console.log("sessionUser", sessionUser);
      }
      if (req?.session?.refresh) {
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
      if (!validUser) return null;
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
        const { username, password, email, confirmPassword } = input;
        const errors = registerValidation(
          username,
          password,
          confirmPassword,
          email
        );
        if (errors.length > 0) return { errors };
        const hashedPW = await bcrypt.hash(password, 12);
        const newUser = {
          username,
          password: hashedPW,
          tokenVersion: 0,
          email,
        };
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
      const destroyed = await req.session.destroy();
      console.log({ destroyed });
      if (destroyed.userId) {
        return true;
      }
      // not logged out
      return false;
    },
    forgotPassword: async (_, { email }, { db, req }) => {
      const foundUser = await db
        .db("jwtCookie")
        .collection("users")
        .findOne({ email });
      if (!foundUser) {
        return false;
      }
      // const token = v4();
      console.log("foundUser", foundUser);
      const threeDays = 1000 * 60 * 60 * 24 * 3; // 3 days

      const tokenToEmail = sign(
        { userId: foundUser._id },
        process.env.ACCESS_TOKEN!,
        { expiresIn: threeDays }
      );

      // const cookies = setTokenCookies({ tokenToEmail, tokenToSession });
      // const setForgotCookies = ({ tokenToEmail }: any) => {
      //   return {
      //     forgotPassword: ["forgotPassword", tokenToEmail],
      //   };
      // };
      // const cookies = setForgotCookies({ tokenToEmail });

      // req.session.forgotPassword = cookies.forgotPassword[1];
      req.session.forgotPassword = tokenToEmail;
      req.session.userId = foundUser._id;
      const preset = `?token=${tokenToEmail}`;
      // return { user: user.ops[0], accessToken };
      await sendEmail(
        email,
        `<a href="http://localhost:3000/change-password${preset}">reset password</a>`
      );
      return true;
    },
    changePassword: async (_, { options }, { db, req, res }) => {
      const { password, confirmPassword, accessToken } = options;
      const errors: any = [];
      // console.log("req", req);
      if (res.cookie) {
        console.log("deleteing hank");
        await res.clearCookie(COOKIE_NAME);
      }

      try {
        if (!accessToken || accessToken === "") {
          console.log("no accessToken or it's bad");
          errors.push({
            source: "accessToken",
            message: "Bad Access Token",
          });
        }
        const validToken = verify(accessToken, process.env.ACCESS_TOKEN!);
        console.log("validToken", validToken);
        console.log("req.session.forgotPassword", req.session.forgotPassword);
        console.log(
          "MATCH",
          JSON.stringify(accessToken) !==
            JSON.stringify(req.session.forgotPassword)
        );
        const validSessionToken = verify(
          req.session.forgotPassword,
          process.env.ACCESS_TOKEN!
        );
        console.log("validSessionToken", validSessionToken);
        if (!validSessionToken) {
          return { error: { message: "Bad Token" } };
        }
        if (JSON.stringify(validToken) !== JSON.stringify(validSessionToken)) {
          console.log("validToken not equeal to validSessionToken");
          return { error: { message: "to long has passed try again" } };
        }
        if (!password || password === "") {
          console.log("passwords don't match");
          errors.push({ source: "password", message: "Bad password" });
        }
        if (!confirmPassword || confirmPassword === "") {
          errors.push({
            source: "confirmPassword",
            message: "Bad password",
          });
        }
        if (
          password.toLowerCase().trim() !== confirmPassword.toLowerCase().trim()
        ) {
          errors.push({
            source: "password",
            message: "Passwords don't match!",
          });
        }
        if (errors.length > 0) {
          return { errors };
        }
        const user: any = verify(accessToken, process.env.ACCESS_TOKEN!);
        console.log("user from accessToken changePW", user);
        if (!user && !user.userId) {
          return {
            error: {
              message:
                "Invalid Token... may need to resubmit if longer than hour",
            },
          };
        }
        const foundUser = await db
          .db("jwtCookie")
          .collection("users")
          .findOne({ _id: new ObjectID(user.userId) });
        console.log("foundUser from changePW", foundUser);
        if (!foundUser) {
          return { error: { message: "Sorry No user found try registering" } };
        }
        // const validPw = await bcrypt.compare(foundUser.password, password);
        const hashedPW = await bcrypt.hash(password, 12);
        console.log({ hashedPW });
        const filter = { _id: new ObjectID(user.userId) };
        const updates = { $set: { password: hashedPW } };
        const updatedUser = await db
          .db("jwtCookie")
          .collection("users")
          .findOneAndUpdate(filter, updates, { returnOriginal: false });
        console.log("updatedUser from changePW", updatedUser);
        if (!updatedUser) {
          return {
            error: { message: "Could not update the user at this time." },
          };
        } else {
          const { accessToken, refreshToken } = setTokens(updatedUser.value);
          console.log({ accessToken });
          console.log({ refreshToken });
          const cookies = setTokenCookies({ accessToken, refreshToken });
          console.log({ cookies });

          console.log("session destroyed");
          req.session.destroy();
          req.session.refresh = cookies.refresh[1];
          req.session.userId = updatedUser.value._id;
          console.log("req.session", req.session);

          return { user: updatedUser.value, accessToken };
        }
      } catch (err) {
        console.log("err");
        return { error: { message: "Something went wrong internally" } };
      }
    },
  },
  Subscription: {
    somethingChanged: {
      subscribe: (_, __, { connection }) => {
        console.log("connection from subscribe", connection);
        console.log("connection.context", connection.context);
        return connection.pubsub.asyncIterator(SOMETHING_CHANGED);
      },
    },
  },
};
