import React from "react";
import { Route } from "react-router-dom";
import Home from "./components/Home";

const AuthenticatedApp = () => {
  return (
    <>
      <Route exact path="/" component={Home} />
    </>
  );
};

export default AuthenticatedApp;
