import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useMeLazyQuery } from "../../codeGenFE";

const userReducer = (state, action) => {
  switch (action.type) {
    case "loadingUser":
      return {
        ...state,
        loadingUser: true,
      };
    case "errorGettingUser":
      return {
        ...state,
        loadingUser: false,
        userError: action.error,
      };
    case "noUser":
      return {
        ...state,
        loadingUser: false,
        userError: "No User - how the hell did we get here?",
      };
    case "user":
      return {
        ...state,
        userError: "",
        loadingUser: false,
        user: action.payload,
      };
    case "logout":
      return {
        ...state,
        user: null,
        loadingUser: false,
        userError: "",
      };
    default:
      return {
        ...state,
      };
  }
};

const initState = {
  loadingUser: false,
  userError: "",
  user: null,
};

export const UserContext = createContext();

export function UserProvider(props) {
  const [meData, { data, loading, error }] = useMeLazyQuery();
  const [userState, userDispatch] = useReducer(userReducer, initState);
  // const {loadingUser, userError, user} = userState;

  useEffect(() => {
    const user = data?.me?.user;
    if (loading) {
      userDispatch({ type: "loadingUser" });
    }

    if (error) {
      console.log("error", error);
      userDispatch({ type: "errorGettingUser", error: error.message });
    }

    if (!loading && !user) {
      userDispatch({ type: "noUser" });
    }

    if (user) {
      console.log("data.me.user", data.me.user);
      userDispatch({ type: "user", payload: data.me.user });
    }
  }, [data, loading, error]);

  useEffect(() => {
    meData();
  }, []);

  return (
    <UserContext.Provider value={{ userState, userDispatch }}>
      {props.children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => {
  return useContext(UserContext);
};
