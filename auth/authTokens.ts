import { User } from "../codeGenBE";
import { sign } from "jsonwebtoken";

export const setTokens = (user: User) => {
  const sevenDays = 60 * 60 * 24 * 7 * 1000;
  const fifteenMins = 60 * 15 * 1000;
  const accessUser = {
    id: user._id,
  };
  console.log("accessUser", accessUser);

  const accessToken = sign({ user: accessUser }, process.env.ACCESS_TOKEN!, {
    expiresIn: fifteenMins,
  });
  console.log("accessToken", accessToken);

  const refreshUser = {
    id: user._id,
    tokenVersion: user.tokenVersion,
  };
  console.log("refreshUser", refreshUser);

  const refreshToken = sign(
    {
      user: refreshUser,
    },
    process.env.REFRESH_ACCESS_TOKEN!,
    { expiresIn: sevenDays }
  );
  console.log("refreshToken", refreshToken);

  return { accessToken, refreshToken };
};
