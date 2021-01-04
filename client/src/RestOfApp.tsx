import React from "react";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./components/Home";
import { useMeQuery } from "./codeGenFE";

const RestOfApp = () => {
  const { data, loading, error } = useMeQuery();

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <PrivateRoute
        path="/app/"
        loggedIn={!!data?.me.user?._id}
        component={Home}
      />
    </div>
  );
};

export default RestOfApp;
