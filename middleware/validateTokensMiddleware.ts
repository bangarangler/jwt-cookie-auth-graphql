import {
  validateAccessToken,
  validateRefreshToken,
} from "../auth/validateTokens";
import { ObjectID } from "mongodb";
import { COOKIE_NAME } from "../constants";
import { setTokenCookies, setTokens } from "../auth/authTokens"; // double check this as well
// import { ApolloError } from "apollo-server-express";
// import { COOKIE_NAME } from "../constants";

export const validateTokensMiddleware = async (
  req: any,
  res: any,
  next: any,
  db?: any
) => {
  console.log(
    "======================================================================="
  );
  console.log("middleware running...");
  // Try to Get JWT from Headers and refresh JWT from session
  const accessToken = req?.headers["bearer"];
  const refreshToken = req?.session?.refresh;
  // no tokens ... don't know you... go to login or register
  // if (!accessToken && !refreshToken && !req.session.userId) {
  //   throw new ApolloError("Not Authenticated");
  // }
  if (!accessToken && !refreshToken) {
    // is this needed?
    // req.session.destroy;
    return next();
  }

  // if you have been here before...
  if (accessToken) {
    console.log("checking access token");
    // check if accessToken is still valid and if so give us the user.
    const decodedAccessToken = validateAccessToken(accessToken) as any;
    // token is valid and token has userId
    if (decodedAccessToken && decodedAccessToken.userId) {
      console.log("Access token is valid");
      // set userId to session
      req.session.userId = decodedAccessToken.userId;
      return next();
    }
  }

  // no accessToken so check refreshToken from coookie-session
  if (refreshToken) {
    console.log("checking refresh token");
    const decodedRefreshToken = validateRefreshToken(refreshToken);
    // if it's valid and there is a user
    if (decodedRefreshToken && decodedRefreshToken.user) {
      console.log("refresh token exists");
      // fetch the user from db
      const user = await db
        .db("jwtCookie")
        .collection("users")
        .findOne({ _id: new ObjectID(decodedRefreshToken.user.userId) });

      // if no user or tokenVersion don't match decodedRefreshToken clearCookie
      // and destroy session (it's bad request or tampered with the token)
      if (
        !user ||
        user.tokenVersion !== decodedRefreshToken.user.tokenVersion
      ) {
        console.log("destroying session and clearing cookies");
        res.clearCookie(COOKIE_NAME);
        req.session.destroy();
        // consider 401 here
        return next();
      }
      // make new refresh and access from the user from db
      const userTokens = setTokens(user);
      res.set({
        "Access-Control-Expose-Headers": "bearer",
        bearer: userTokens.accessToken,
      });
      // make refresh token and set to session
      const cookies = setTokenCookies(userTokens);
      req.session.refresh = cookies.refresh;
      console.log("Refreshing session cookies");
      return next();
    }
  }
  next();
};
