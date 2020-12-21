import React, { FC } from "react";
import { Route, Link } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Home from "./components/Home";
import User from "./components/User";

import "./App.css";

const App: FC = () => {
  return (
    <div className="App">
      <p>app start</p>
      <User />
      <nav>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        {/*<Link to="/">Home</Link>*/}
      </nav>
      {/* <Switch> */}
      <Route exact path="/login" component={LoginForm} />
      <Route exact path="/register" component={RegisterForm} />
      {/*<Route exact path="/" component={Home} />*/}
      {/* </Switch> */}
      <Home />
    </div>
  );
};

export default App;
