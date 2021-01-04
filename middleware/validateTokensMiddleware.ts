import { validateRefreshToken } from "../auth/validateTokens";
import { ObjectID } from "mongodb";
import { COOKIE_JWT_REFRESH_TIME, COOKIE_NAME } from "../constants";
import { setTokens } from "../auth/authTokens"; // double check this as well
import { s2mConverter } from "../utils/timeConverter";
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
  console.log("req.headers", req.headers);
  const refreshToken = req?.session?.refresh;

  console.log("req.session :>> ", req?.session);
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
      const token = setTokens(user);
      // console.log("token >> ", token);
      // make refresh token and set to session
      // console.log("req.session.refresh before:>> ", req.session.refresh);
      req.session.refresh = token;
      // console.log("req.session.refresh after:>> ", req.session.refresh);
      // console.log("req.session.cookie before :>> ", req.session.cookie);
      req.session.cookie.maxAge = s2mConverter(COOKIE_JWT_REFRESH_TIME);
      // console.log("req.session.cookie after :>> ", req.session.cookie);

      // console.log("HERE >>>>>>>>>>>>>>>>>>>>> ", user._id);
      req.session.userId = user._id;
      console.log("Refreshed Cookie");
      return next();
    }
  }
  console.log("Skipped refreshing cookie");
  next();
};
