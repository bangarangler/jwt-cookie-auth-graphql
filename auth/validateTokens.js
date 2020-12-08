const { verify } = require("jsonwebtoken");
function validateAccessToken(token) {
  try {
    return verify(token, process.env.ACCESS_TOKEN);
  } catch (err) {
    console.log("err", err);
    return null;
  }
}

function validateRefreshToken(token) {
  try {
    return verify(token, process.env.REFRESH_ACCESS_TOKEN);
  } catch {
    return null;
  }
}
