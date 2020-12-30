import Cookies from "universal-cookie";

const TOKEN_NAME = "authToken";
const cook = new Cookies();

export const useAuthToken = () => {
  // const [cookies, setCookie, removeCookie] = useCookies([TOKEN_NAME]);

  const setAuthToken = (authToken) => {
    const options = {
      maxAge: 10,
    };
    cook.set(TOKEN_NAME, authToken, options);
  };
  // setCookie(TOKEN_NAME, authToken, { maxAge: 1000 * 10 });

  const removeAuthToken = () => cook.remove(TOKEN_NAME);

  return [cook.get(TOKEN_NAME), setAuthToken, removeAuthToken];
};
