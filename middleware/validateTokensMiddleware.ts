import {
  validateAccessToken,
  validateRefreshToken,
} from "../auth/validateTokens";
// const userRepo = require("../users/users-repository"); // double check this
const { setTokens } = require("../auth/authTokens"); // double check this as well

export const validateTokensMiddleware = async (
  req: any,
  res: any,
  next: any,
  db: any
) => {
  const refreshToken = req.headers["x-refresh-token"];
  const accessToken = req.headers["x-access-token"];
  console.log("refreshToken", refreshToken);
  console.log("accessToken", accessToken);

  if (!accessToken && !refreshToken) return next();

  const decodedAccessToken = (await validateAccessToken(accessToken)) as any;
  console.log("decodedAccessToken", decodedAccessToken);
  console.log("decodedAccessToken running...");
  if (decodedAccessToken && decodedAccessToken.user) {
    req.user = decodedAccessToken.user;
    return next();
  }

  const decodedRefreshToken = (await validateRefreshToken(refreshToken)) as any;
  console.log("decodedRefreshToken running");
  if (decodedRefreshToken && decodedRefreshToken.user) {
    const user = await db
      .db("jwtCookie")
      .collection("users")
      .findOne({ _id: decodedRefreshToken.user._id });
    console.log("user from decodedRefreshToken", user);

    if (!user || user.tokenVersion !== decodedRefreshToken.user.tokenVersion)
      return next();
    req.user = decodedRefreshToken.user;

    const userTokens = setTokens(user);
    console.log("userTokens...", userTokens);
    res.set({
      "Access-Control-Expose-Headers": "x-access-token, x-refresh-token",
      "x-access-token": userTokens.accessToken,
      "x-refresh-token": userTokens.refreshToken,
    });
    return next();
  }
  next();
};
