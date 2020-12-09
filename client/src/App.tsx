import React, { FC } from "react";
import { Route, Link } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Home from "./components/Home";

import "./App.css";

const App: FC = () => {
  return (
    <div className="App">
      <p>app start</p>
      <nav>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/">Home</Link>
      </nav>
      {/* <Switch> */}
      <Route exact path="/login" component={LoginForm} />
      <Route exact path="/register" component={RegisterForm} />
      <Route exact path="/" component={Home} />
      {/* </Switch> */}
    </div>
  );
};

export default App;
