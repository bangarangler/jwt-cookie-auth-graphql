import { rule } from "graphql-shield";
// import { ServerContext } from "../ServerContext";

export const isAuthenticated = rule()(
  async (_, __, { req }, ___): Promise<any> => {
    // const refreshToken = req?.session?.refresh;
    // const accessToken = req.headers["bearer"];
    // if (!refreshToken || !accessToken) {
    // console.log("accessToken", accessToken);
    console.log("req.session from isAuthenticated", req.session.userId);
    // console.log("refreshToken", refreshToken);
    // if (!refreshToken || !refreshToken) {

    // }
    return req.session.userId !== undefined;
  }
);
