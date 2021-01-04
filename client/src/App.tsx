import React, { FC, useEffect } from "react";
import { Route, Link, useHistory, useLocation } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import RestOfApp from "./RestOfApp";
// import User from "./components/User";

import "./App.css";
import { useMeLazyQuery, useMeQuery } from "./codeGenFE";
import PrivateRoute from "./components/PrivateRoute";

const App: FC = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    window.localStorage.setItem("initURL", path);
    //   const test = window.localStorage.getItem("initURL");
  }, []);

  // const { data, loading, error } = useMeQuery();

  // if (loading) {
  //   return <p>Loading...</p>;
  // }

  return (
    <div className="App">
      <p>app start</p>
      {/* <User /> */}
      <nav>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/app/">Home</Link>
      </nav>
      {/* <Switch> */}
      <Route exact path="/login" component={LoginForm} />
      <Route exact path="/register" component={RegisterForm} />
      <Route path="/app" component={RestOfApp} />
      {/* <PrivateRoute
        exact
        path="/"
        // loggedIn={!!data?.me.user?._id}
        loggedIn={true}
        component={Home}
      /> */}
      {/* </Switch> */}
    </div>
  );
};

export default App;
