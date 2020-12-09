import { Tokens, User } from "../codeGenFE";

export const TOKEN_KEY = "jcy";
export const USER_KEY = "jcyusr";

export const saveTokens = (tokens: Tokens): void => {
  console.log("saving tokens to local storage");
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
};

export const saveUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getTokens = (): Tokens | null => {
  console.log("getting tokens...");
  const token = localStorage.getItem(TOKEN_KEY);
  console.log("token from getToken", token);
  if (token) {
    console.log("we have a token");
    return JSON.parse(token);
  } else {
    console.log("no token");
    return null;
  }
};

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  if (user) {
    return JSON.parse(user);
  } else {
    console.log("no token");
    return null;
  }
};

export const deleteToken = (): void => {
  console.log("deleteing token");
  localStorage.removeItem(TOKEN_KEY);
};

export const deleteUser = (): void => {
  localStorage.removeItem(USER_KEY);
};
