import { User } from "../codeGenBE";
import { sign } from "jsonwebtoken";
import {
  COOKIE_JWT_REFRESH_TIME,
  // JWT_ACCESS_TOKEN_TIME,
  __prod__,
} from "../constants";

export const setTokens = (user: User) => {
  // const sevenDays = '7d';
  // const fifteenMins = 60 * 15 * 1000;
  // const accessUser = user._id;

  // // console.log("accessUser", accessUser);

  // const accessToken = sign({ userId: accessUser }, process.env.ACCESS_TOKEN!, {
  //   // expiresIn: '15m',
  //   // expiresIn: 1000 * 15,
  //   expiresIn: JWT_ACCESS_TOKEN_TIME,
  // });
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
    // { expiresIn: sevenDays }
    { expiresIn: COOKIE_JWT_REFRESH_TIME }
    // { expiresIn: 5 }
  );
  // console.log("refreshToken", refreshToken);

  return refreshToken;
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
