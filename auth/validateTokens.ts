import { verify } from "jsonwebtoken";
export const validateAccessToken = (token: string) => {
  try {
    console.log(
      "validateAccessTokenRes",
      verify(token, process.env.ACCESS_TOKEN!)
    );
    return verify(token, process.env.ACCESS_TOKEN!);
  } catch (err) {
    console.log("err", err);
    return null;
  }
};

export const validateRefreshToken = (token: string) => {
  try {
    console.log(
      "validateRefreshToken res",
      verify(token, process.env.REFRESH_ACCESS_TOKEN!)
    );
    return verify(token, process.env.REFRESH_ACCESS_TOKEN!);
  } catch {
    return null;
  }
};
