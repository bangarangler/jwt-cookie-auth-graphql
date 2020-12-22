// import { verify } from "jsonwebtoken";
import { setTokens } from "../../auth/authTokens";
import { ObjectID } from "mongodb";
import {
  MutationResolvers,
  QueryResolvers,
  TokenResponse,
} from "../../codeGenBE";
// import { setTokenCookies, setTokens } from "../../auth/authTokens";
// import { setTokens } from "../../auth/authTokens";
// import { COOKIE_NAME } from "../../constants";

interface Resolvers {
  Query: QueryResolvers;
  Mutation: MutationResolvers;
}

export const authResolvers: Resolvers = {
  Query: {
    getToken: async (_, __, { req, db }, ____): Promise<TokenResponse> => {
      console.log("get token resolver running");
      try {
        console.log("req?.session?.userId :>> ", req?.session);
        if (req?.session?.userId) {
          const user = await db
            .db("jwtCookie")
            .collection("users")
            .findOne({ _id: new ObjectID(req.session.userId) });

          const tokens = setTokens(user);
          console.log("tokens :>> ", tokens);

          return { accessToken: tokens.accessToken };
        } else {
          return { accessToken: "" };
        }
      } catch (error) {
        console.log("error :>> ", error);
        return { error: { message: error } };
      }
    },
  },
  Mutation: {},
};
