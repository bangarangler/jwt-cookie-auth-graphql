import React, { FC, useReducer } from "react";

type State = {
  username: string;
  password: string;
  confirmPassword: string;
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
  confirmPassword: "",
};

const RegisterForm: FC = () => {
  const [state, dispatch] = useReducer(reducer, initState);
  const { username, password, confirmPassword } = state;
  return (
    <form
      onSubmit={() => {
        console.log("register");
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
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterForm;
