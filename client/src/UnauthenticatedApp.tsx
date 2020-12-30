import React, { FC } from "react";
import { Route } from "react-router-dom";
// COMPONENTS
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

const UnauthenticatedApp: FC = () => {
  return (
    <>
      <Route exact path="/login" component={LoginForm} />
      <Route exact path="/register" component={RegisterForm} />
    </>
  );
};

export default UnauthenticatedApp;
