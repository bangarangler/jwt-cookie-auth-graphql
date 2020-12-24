// import { verify } from "jsonwebtoken";
import { setTokenCookies, setTokens } from "../../auth/authTokens";
import { ObjectID } from "mongodb";
import {
  MutationResolvers,
  QueryResolvers,
  TokenResponse,
} from "../../codeGenBE";
import { validateRefreshToken } from "../../auth/validateTokens";
import { COOKIE_JWT_REFRESH_TIME, COOKIE_NAME } from "../../constants";
import { s2mConverter } from "../../utils/timeConverter";
// import { setTokenCookies, setTokens } from "../../auth/authTokens";
// import { setTokens } from "../../auth/authTokens";
// import { COOKIE_NAME } from "../../constants";

interface Resolvers {
  Query: QueryResolvers;
  Mutation: MutationResolvers;
}

export const authResolvers: Resolvers = {
  Query: {
    getToken: async (_, __, { req, res, db }, ____): Promise<TokenResponse> => {
      console.log("get token resolver running");
      try {
        // TODO: Check token version somewhere here as well
        // TODO: Get cookie from redis and do a deep check that they both match
        // TODO: Use only cookie stored on redis

        const refreshToken = req?.session?.refresh;
        console.log("refreshToken :>> ", refreshToken);
        if (!refreshToken) throw "UNAUTHORIZED";

        const decodedRefreshToken = validateRefreshToken(refreshToken);
        console.log("decodedRefreshToken :>> ", decodedRefreshToken);
        if (!decodedRefreshToken || !decodedRefreshToken.user)
          throw "UNAUTHORIZED";

        const user = await db
          .db("jwtCookie")
          .collection("users")
          .findOne({ _id: new ObjectID(decodedRefreshToken.user.userId) });

        if (
          !user ||
          user.tokenVersion !== decodedRefreshToken.user.tokenVersion
        ) {
          throw "UNAUTHORIZED";
        }
        const userTokens = setTokens(user);

        const cookies = setTokenCookies(userTokens);
        req.session.refresh = cookies.refresh[1];
        req.session.cookie.maxAge = s2mConverter(COOKIE_JWT_REFRESH_TIME);
        req.session.userId = user._id;

        res.set({
          "Access-Control-Expose-Headers": "bearer",
          bearer: userTokens.accessToken,
        });

        return { accessToken: userTokens.accessToken };

        // ==================== old code ========================
        // console.log("req?.session?.userId :>> ", req?.session);
        // if (req?.session?.userId) {
        //   const user = await db
        //     .db("jwtCookie")
        //     .collection("users")
        //     .findOne({ _id: new ObjectID(req.session.userId) });

        //   const tokens = setTokens(user);
        //   console.log("tokens :>> ", tokens);

        //   return { accessToken: tokens.accessToken };
        // } else {
        // }
      } catch (error) {
        if (error === "UNAUTHORIZED") {
          res.clearCookie(COOKIE_NAME);
          req.session.destroy();
        }
        console.log("error :>> ", error);
        return { error: { message: error } };
      }
    },
  },
  Mutation: {},
};
