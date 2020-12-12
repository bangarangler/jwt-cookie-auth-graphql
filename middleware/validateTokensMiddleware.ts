import {
  validateAccessToken,
  validateRefreshToken,
} from "../auth/validateTokens";
import { ObjectID } from "mongodb";
import { COOKIE_NAME } from "../constants";
import { setTokenCookies, setTokens } from "../auth/authTokens"; // double check this as well
// import { COOKIE_NAME } from "../constants";

export const validateTokensMiddleware = async (
  req: any,
  res: any,
  next: any,
  db?: any
) => {
  // Try to Get JWT from Headers and refresh JWT from session
  const accessToken = req.headers["bearer"];
  const refreshToken = req?.session?.refresh?.[1];
  // no tokens ... don't know you... go to login or register
  if (!accessToken && !refreshToken) {
    // is this needed?
    // req.session.destroy;
    return next();
  }

  // if you have been here before...
  if (accessToken) {
    // check if accessToken is still valid and if so give us the user.
    const decodedAccessToken = validateAccessToken(accessToken) as any;
    console.log("decodedAccessToken", decodedAccessToken);
    // token is valid and token has userId
    if (decodedAccessToken && decodedAccessToken.userId) {
      // set userId to session
      req.session.userId = decodedAccessToken.userId;
      return next();
    }
  }

  // no accessToken so check refreshToken from coookie-session
  const decodedRefreshToken = validateRefreshToken(refreshToken);
  // if it's valid and there is a user
  if (decodedRefreshToken && decodedRefreshToken.user) {
    // fetch the user from db
    const user = await db
      .db("jwtCookie")
      .collection("users")
      .findOne({ _id: new ObjectID(decodedRefreshToken.user.userId) });
    console.log("user from decodedRefreshToken", user);

    // if no user or tokenVersion don't match decodedRefreshToken clearCookie
    // and destroy session (it's bad request or tampered with the token)
    if (!user || user.tokenVersion !== decodedRefreshToken.user.tokenVersion) {
      console.log(
        "no user or tokenVersion not = decodedRefreshToken.user.tokenVersion"
      );
      res.clearCookie(COOKIE_NAME);
      req.session.destroy;
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
    return next();
  }
  next();
};
