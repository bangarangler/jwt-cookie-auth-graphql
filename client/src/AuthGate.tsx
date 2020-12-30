import React, { useEffect } from "react";
import { useAuthToken } from "./authToken";
import { useUserContext } from "./context/allContexts";
// COMPONENTS
import AuthenticatedApp from "./AuthenticatedApp";
import UnauthenticatedApp from "./UnauthenticatedApp";

const AuthGate = () => {
  const [authToken] = useAuthToken();
  const { userState } = useUserContext();
  useEffect(() => {
    console.log("authToken from authgate", authToken);
    console.log("userState from authgate", userState);
  }, [authToken, userState]);
  if (userState?.user && authToken) {
    return <AuthenticatedApp />;
  } else {
    return <UnauthenticatedApp />;
  }
};

export default AuthGate;
