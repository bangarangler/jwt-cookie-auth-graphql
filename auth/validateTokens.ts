import { verify } from "jsonwebtoken";

// export interface ValidUser {
//   user: string
//   iat: number
//   exp: number
// }

export const validateAccessToken = (token: string): null | any => {
  try {
    const data: any = verify(token, process.env.ACCESS_TOKEN!);
    if (data?.exp > Date.now() / 1000) {
      return data;
    }
    return null;
  } catch (err) {
    console.log("err", err);
    return null;
  }
};

export const validateRefreshToken = (token: string): null | any => {
  try {
    const data: any = verify(token, process.env.REFRESH_ACCESS_TOKEN!);
    if (data?.exp > Date.now() / 1000) {
      return data;
    }
    return null;
  } catch (err) {
    console.log("err", err);
    return null;
  }
};
