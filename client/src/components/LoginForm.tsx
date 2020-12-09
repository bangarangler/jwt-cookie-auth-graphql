import React, { FC, useReducer } from "react";
import { useLoginMutation } from "../codeGenFE";
import { saveTokens } from "../utilsFE/tempToken";

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
  // Local state
  const [state, dispatch] = useReducer(reducer, initState);
  const { username, password } = state;

  // apollo state
  const [login, { data, loading, error }] = useLoginMutation({
    variables: {
      input: {
        username,
        password,
      },
    },
    update: (_, { data }) => {
      console.log("data here", data?.login.tokens);
      if (data && data.login && data.login.tokens) {
        console.log("data.login.tokens", data.login.tokens);
        const { accessToken, refreshToken } = data.login.tokens;
        // console.log({accessToken, refreshToken})
        saveTokens({ accessToken, refreshToken });
      }
    },
  });

  if (error) {
    console.log("error", error);
    return null;
  }

  if (loading) {
    return <div>loading...</div>;
  }

  if (data) {
    console.log("data", data);
  }

  return (
    <form
      onSubmit={() => {
        console.log("Login");
        login();
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
