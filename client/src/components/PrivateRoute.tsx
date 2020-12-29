import React, { FC, ReactHTMLElement, useEffect } from "react";
import { Route, Redirect } from "react-router-dom";

interface Component {
  component: any;
  loggedIn: boolean;
  exact?: any;
  path: any;
  resetMemToken: () => void;
}

const PrivateRoute: FC<Component> = ({
  resetMemToken,
  component: Component,
  loggedIn,
  ...rest
}: Component) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        loggedIn ? (
          <Component {...props} resetMemToken={resetMemToken} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;
