import React, { FC } from "react";
import { Route, Link } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

import "./App.css";

const App: FC = () => {
  return (
    <div className="App">
      <p>app start</p>
      <nav>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </nav>
      {/* <Switch> */}
      <Route exact path="/login" component={LoginForm} />
      <Route exact path="/register" component={RegisterForm} />
      {/* </Switch> */}
    </div>
  );
};

export default App;
