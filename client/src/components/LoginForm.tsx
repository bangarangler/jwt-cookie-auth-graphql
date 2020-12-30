import React, { FC, useReducer, useEffect } from "react";
import { useHistory } from "react-router-dom";
// import { useImprovedLoginMutation } from "../improvedLoginMutation";
import {
  useLoginMutation,
  MeDocument,
  MeQueryVariables,
  MeQuery,
  // User,
  // useMeLazyQuery,
  // useMeQuery,
} from "../codeGenFE";
import { useAuthToken } from "../authToken";
import { useUserContext } from "../context/allContexts";
// import { saveTokens, saveUser } from "../utilsFE/tempToken";
// import { saveUser } from "../utilsFE/tempToken";

type State = {
  username: string;
  password: string;
};

type Action = { type: "input"; field: string; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "input":
      return {
        ...state,
        [action.field]: action.payload,
      };
    default:
      return state;
  }
};

const initState = {
  username: "",
  password: "",
};

const LoginForm: FC = () => {
  const history = useHistory();
  const { userDispatch } = useUserContext();
  const [, setAuthToken] = useAuthToken();
  // Local state
  const [state, dispatch] = useReducer(reducer, initState);

  const { username, password } = state;
  // const [login] = useImprovedLoginMutation();

  const [login, { data, loading, error }] = useLoginMutation({
    variables: {
      input: {
        username,
        password,
      },
    },
    update: async (cache, { data }) => {
      console.log("update running...");
      if (data?.login.user) {
        // console.log("data from update", data?.login?.accessToken);
        setAuthToken(data?.login?.accessToken);
        userDispatch({ type: "user", payload: data.login.user });
        const user = data?.login.user;
        console.log("user", user);
        cache.writeQuery<MeQuery, MeQueryVariables>({
          query: MeDocument,
          data: {
            me: {
              user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                tokenVersion: user.tokenVersion,
              },
            },
          },
        });
      }
    },
    onCompleted: (cache) => {
      console.log("cache", cache);
      // runLazyMeQuery();
      // setAuthToken(data?.login?.accessToken);
    },
    onError: (err) => {
      console.log("err", err);
    },
  });

  // useEffect(() => {
  //   if (data?.login.user) {
  //     setAuthToken(data.login.user);
  //   }
  // }, [data, loading, error]);

  if (error) {
    console.log("error", error);
    return null;
  }

  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // login({ input: { username, password } });
        login();
        history.push("/");
      }}>
      <label htmlFor="username">Username</label>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) =>
          dispatch({
            type: "input",
            field: "username",
            payload: e.target.value,
          })
        }
      />
      <label htmlFor="password">Password</label>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          dispatch({
            type: "input",
            field: "password",
            payload: e.target.value,
          })
        }
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;
