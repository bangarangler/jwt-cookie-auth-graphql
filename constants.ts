export const __prod_cors__ =
  process.env.NODE_ENV !== "production"
    ? { origin: ["http://localhost:3000"], credentials: true }
    : { origin: ["https://putWebURLHERE.com"], credentials: true };

export const __prod__ = process.env.NODE_ENV === "production" ? true : false;

export const COOKIE_NAME = "hank";
