import React, { FC, ReactElement, useEffect, useReducer } from "react";
import { useRegisterMutation } from "../codeGenFE";

type State = {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  localLoading: ReactElement | null;
};

type Action =
  | { type: "input"; field: string; payload: string }
  | {
      type: "local loading";
      localLoading: ReactElement;
    };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "input":
      return {
        ...state,
        [action.field]: action.payload,
      };
    case "local loading":
      return {
        ...state,
        localLoading: <p>Loading</p>,
      };
    default:
      return state;
  }
};

const initState = {
  username: "",
  password: "",
  confirmPassword: "",
  email: "",
  localLoading: null,
};

const RegisterForm: FC = () => {
  const [state, dispatch] = useReducer(reducer, initState);
  const { username, password, email, confirmPassword, localLoading } = state;
  const [register, { data, loading, error }] = useRegisterMutation({
    variables: {
      input: {
        username,
        password,
        email,
        confirmPassword,
      },
    },
  });

  useEffect(() => {
    console.log({ data });
  }, [data]);

  if (loading) {
    // if (loading) {
    //   dispatch({ type: "local loading", localLoading: <p>loading...</p> });
    // }
    return <div>loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        console.log("register");
        const test = await register();
        console.log("test", test);
      }}>
      {/*{!loading && { localLoading }}*/}
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
      <label htmlFor="email">Email</label>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          dispatch({
            type: "input",
            field: "email",
            payload: e.target.value,
          })
        }
      />
      <label htmlFor="password">Password</label>
      <input
        type="text"
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
      <label htmlFor="confirmPassword">Confirm Password</label>
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) =>
          dispatch({
            type: "input",
            field: "confirmPassword",
            payload: e.target.value,
          })
        }
      />
      <button type="submit" disabled={loading}>
        Register
      </button>
    </form>
  );
};

export default RegisterForm;
