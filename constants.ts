export const __prod_cors__ =
  process.env.NODE_ENV !== "production"
    ? { origin: ["http://localhost:3000"], credentials: true }
    : { origin: ["https://putWebURLHERE.com"], credentials: true };

export const __prod__ = process.env.NODE_ENV === "production" ? true : false;

export const COOKIE_NAME = "hank";

// export const COOKIE_JWT_REFRESH_TIME = 1000 * 60 * 60 * 24 * 7; // 7 days
export const COOKIE_JWT_REFRESH_TIME = 120; // in seconds

// export const JWT_ACCESS_TOKEN_TIME = 1000 * 60 * 15; // 15 Minutes
export const JWT_ACCESS_TOKEN_TIME = 60; // in seconds
