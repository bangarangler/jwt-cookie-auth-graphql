import {
  validateAccessToken,
  validateRefreshToken,
} from "../auth/validateTokens";
// const userRepo = require("../users/users-repository"); // double check this
import { setTokenCookies, setTokens } from "../auth/authTokens"; // double check this as well

export const validateTokensMiddleware = async (
  req: any,
  res: any,
  next: any,
  db: any
) => {
  // const refreshToken = req.headers["x-refresh-token"];
  // const accessToken = req.headers["x-access-token"];
  const refreshToken = req.cookies["refresh"];
  const accessToken = req.cookies["access"];
  console.log("refreshToken", refreshToken);
  console.log("accessToken", accessToken);

  if (!accessToken && !refreshToken) return next();

  const decodedAccessToken = (await validateAccessToken(accessToken)) as any;
  // console.log("decodedAccessToken", decodedAccessToken);
  // console.log("decodedAccessToken running...");
  // console.log("decodedAccessToken.user", decodedAccessToken.user);
  if (decodedAccessToken && decodedAccessToken.user) {
    // console.log("decodedAccessToken running inside if");
    req.user = decodedAccessToken.user;
    return next();
  }

  const decodedRefreshToken = (await validateRefreshToken(refreshToken)) as any;
  // console.log("decodedRefreshToken running...");
  if (decodedRefreshToken && decodedRefreshToken.user) {
    // console.log("have decodedRefreshToken and have decodedRefreshToken.user");
    const user = await db
      .db("jwtCookie")
      .collection("users")
      .findOne({ _id: decodedRefreshToken.user._id });
    // console.log("user from decodedRefreshToken", user);

    if (!user || user.tokenVersion !== decodedRefreshToken.user.tokenVersion) {
      console.log(
        "no user or tokenVersion not = decodedRefreshToken.user.tokenVersion"
      );
      res.clearCookie("access");
      res.clearCookie("refresh");
      return next();
    }
    req.user = decodedRefreshToken.user;

    const userTokens = setTokens(user);
    // console.log("userTokens...", userTokens);
    // res.set({
    //   "Access-Control-Expose-Headers": "x-access-token, x-refresh-token",
    //   "x-access-token": userTokens.accessToken,
    //   "x-refresh-token": userTokens.refreshToken,
    // });
    req.user = decodedRefreshToken.user;
    const cookies = setTokenCookies(userTokens);
    res.cookie(...cookies.access);
    res.cookie(...cookies.refresh);
    return next();
  }
  next();
};
