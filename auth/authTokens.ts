import { User } from "../codeGenBE";
import { sign } from "jsonwebtoken";
import { __prod__ } from "../constants";

export const setTokens = (user: User) => {
  const sevenDays = 60 * 60 * 24 * 7 * 1000;
  const fifteenMins = 60 * 15 * 1000;
  const accessUser = user._id;

  // console.log("accessUser", accessUser);

  const accessToken = sign({ userId: accessUser }, process.env.ACCESS_TOKEN!, {
    expiresIn: fifteenMins,
  });
  // console.log("accessToken", accessToken);

  const refreshUser = {
    userId: user._id,
    tokenVersion: user.tokenVersion,
  };
  // console.log("refreshUser", refreshUser);

  const refreshToken = sign(
    {
      user: refreshUser,
    },
    process.env.REFRESH_ACCESS_TOKEN!,
    { expiresIn: sevenDays }
  );
  // console.log("refreshToken", refreshToken);

  return { accessToken, refreshToken };
};

export const setTokenCookies = ({ accessToken, refreshToken }: any) => {
  // const cookieOptions = {
  //   httpOnly: true,
  //   secure: __prod__, // set for https only
  //   // domain: "app.site.com"
  //   // sameSite: "lax"
  // };
  return {
    // access: ["access", accessToken, cookieOptions],
    access: ["access", accessToken],
    // refresh: ["refresh", refreshToken, cookieOptions],
    refresh: ["refresh", refreshToken],
  };
};
