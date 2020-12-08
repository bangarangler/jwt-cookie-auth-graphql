const {
  validateAccessToken,
  validateRefreshToken,
} = require("../auth/validateTokens");
const userRepo = require("../users/users-repository"); // double check this
const { setTokens } = require("./set-tokens"); // double check this as well

async function validateTokensMiddleware(req, res, next) {
  const refreshToken = req.headers["x-refresh-token"];
  const accessToken = req.headers["x-access-token"];

  if (!accessToken && !refreshToken) return next();

  const decodedAccessToken = vlidateAccessToken(accessToken);
  if (decodedAccessToken && decodedAccessToken.user) {
    req.user = decodedAccessToken.user;
    return next();
  }

  const decodedRefreshToken = validateRefreshToken(refreshToken);
  if (decodedRefreshToken && decodedRefreshToken.user) {
    const user = await userRepo.get({ userId: decodedRefreshToken.user.id });

    if (!user || user.tokenCount !== decodedRefreshToken.user.count)
      return next();
    req.user = decodedRefreshToken.user;

    const userTokens = setTokens(user);
    res.set({
      "Access-Control-Expose-Headers": "x-access-token, x-refresh-token",
      "x-access-token": userTokens.accessToken,
      "x-refresh-token": userTokens.refreshToken,
    });
    return next();
  }
  next();
}
