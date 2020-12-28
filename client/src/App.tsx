import React, { FC, useEffect } from "react";
import { Route, Link, useHistory, useLocation } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Home from "./components/Home";
import User from "./components/User";

import "./App.css";
import { useMeLazyQuery, useMeQuery } from "./codeGenFE";
import PrivateRoute from "./components/PrivateRoute";

const App: FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.log("location :>> ", location);
    const path = location.pathname;
    window.localStorage.setItem("initURL", path);
    const test = window.localStorage.getItem("initURL");
    console.log("test :>> ", test);
  }, []);

  useEffect(() => {
    console.log("location :>> ", location.pathname);
  });

  const { data, loading, error } = useMeQuery();

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="App">
      <p>app start</p>
      <User />
      <nav>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/">Home</Link>
      </nav>
      {/* <Switch> */}
      <Route exact path="/login" component={LoginForm} />
      <Route exact path="/register" component={RegisterForm} />
      <PrivateRoute
        exact
        path="/"
        // loggedIn={!!data?.me.user?._id}
        loggedIn={!!data?.me.user?._id}
        component={Home}
      />
      {/* </Switch> */}
    </div>
  );
};

export default App;
