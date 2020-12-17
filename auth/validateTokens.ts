import { verify } from "jsonwebtoken";

// export interface ValidUser {
//   user: string
//   iat: number
//   exp: number
// }

export const validateAccessToken = (token: string): null | any => {
  try {
    return verify(token, process.env.ACCESS_TOKEN!);
  } catch (err) {
    console.log("err", err);
    return null;
  }
};

export const validateRefreshToken = (token: string): null | any => {
  try {
    return verify(token, process.env.REFRESH_ACCESS_TOKEN!);
  } catch (err) {
    console.log("err", err);
    return null;
  }
};
