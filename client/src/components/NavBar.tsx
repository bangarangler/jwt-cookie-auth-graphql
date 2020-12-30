import React from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "../context/allContexts";

const NavBar = () => {
  const { userState } = useUserContext();
  return (
    <div>
      <nav>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        {userState.user && <Link to="/">Home</Link>}
      </nav>
    </div>
  );
};

export default NavBar;
