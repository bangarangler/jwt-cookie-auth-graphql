import React, { FC, useReducer } from "react";
import { useHistory } from "react-router-dom";
import {
  useLoginMutation,
  MeDocument,
  MeQueryVariables,
  MeQuery,
  User,
} from "../codeGenFE";
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
  // Local state
  const [state, dispatch] = useReducer(reducer, initState);
  const { username, password } = state;
  const history = useHistory();

  // apollo state
  const [login, { data, loading, error }] = useLoginMutation({
    variables: {
      input: {
        username,
        password,
      },
    },
    update: async (cache, { data }) => {
      // const user: any = cache.readQuery<MeQuery, MeQueryVariables>({
      //   query: MeDocument,
      // });
      // console.log("data :>> ", data);
      if (data?.login.user) {
        const user = data?.login.user;
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
        console.log("THING 1");
      }
    },
    onCompleted: () => {
      console.log("THING 2");
      const initPath: string | null = window.localStorage.getItem("initURL");
      if (initPath && initPath !== "/login" && initPath !== "/register") {
        history.push(initPath);
      } else {
        history.push("/");
      }
    },
    onError: (err) => {
      console.log("err", err);
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
      }}
    >
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
