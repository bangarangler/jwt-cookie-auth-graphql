import React, { FC, ReactHTMLElement, useEffect } from "react";
import { Route, Redirect } from "react-router-dom";

interface Component {
  component: any;
  loggedIn: boolean;
  exact?: any;
  path: any;
}

const PrivateRoute: FC<Component> = ({
  component: Component,
  loggedIn,
  ...rest
}: Component) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        loggedIn ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

export default PrivateRoute;
