const { sign } = require("jsonwebtoken");

function setTokens(user) {
  const sevenDays = 60 * 60 * 24 * 7 * 1000;
  const fifteenMins = 60 * 15 * 1000;
  const accessUser = {
    id: user.id,
  };

  const accessToken = sign({ user: accessUser }, process.env.ACCESS_TOKEN, {
    expiresIn: fifteenMins,
  });

  const refreshUser = {
    id: user.id,
    count: user.tokenCount,
  };

  const refreshToken = sign(
    {
      user: refreshUser,
    },
    process.env.REFRESH_ACCESS_TOKEN,
    { expiresIn: sevenDays }
  );

  return { accessToken, refreshToken };
}
