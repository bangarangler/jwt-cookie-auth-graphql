import { validateAccessToken } from "../auth/validateTokens";
// import { ApolloError } from "apollo-server-express";
// import { COOKIE_NAME } from "../constants";

export const validateTokensMiddleware = async (req: any, _: any, next: any) => {
  console.log(
    "======================================================================="
  );
  // this is only here to make typescript happy
  console.log("middleware running...");
  // Try to Get JWT from Headers and refresh JWT from session
  // console.log("req.headers", req.headers);
  const accessToken = req?.headers["bearer"];
  // const refreshToken = req?.session?.refresh;
  // console.log("accessToken", accessToken);

  console.log("accessToken :>> ", accessToken);
  // console.log("refreshToken :>> ", refreshToken);

  // if (!accessToken && !refreshToken) {
  if (!accessToken) {
    if (req?.session?.userId) delete req.session.userId;
    return next();
  } else {
    // console.log("checking access token");
    // check if accessToken is still valid and if so give us the user.
    const decodedAccessToken = validateAccessToken(accessToken) as any;
    // token is valid and token has userId
    console.log("decodedAccessToken :>> ", decodedAccessToken);
    // console.log("Date.now() :>> ", Date.now());
    if (decodedAccessToken && decodedAccessToken.userId) {
      // console.log("Access token is valid");
      // set userId to session
      req.session.userId = decodedAccessToken.userId;
      return next();
    }
    if (req?.session?.userId) delete req.session.userId;
    next();
  }
};
