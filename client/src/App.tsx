import React, { FC, useEffect } from "react";
import { Route, Link, useHistory } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Home from "./components/Home";
import User from "./components/User";

import "./App.css";
import { useMeQuery } from "./codeGenFE";
import PrivateRoute from "./components/PrivateRoute";

const App: FC = () => {
  const { data, loading, error } = useMeQuery();

  useEffect(() => {
    // option 1 (option 2 is in index.tsx)
    // TODO: if network error === 401, push to login and empty cache
    // this will check for logging in and not having a good token or refresh
    // watch out for this pushing people to login page over and over again
    console.log("error?.networkError :>> ", error?.networkError);
  }, [data, loading, error]);

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
      <PrivateRoute exact path="/" loggedIn={true} component={Home} />
      {/* </Switch> */}
    </div>
  );
};

export default App;
