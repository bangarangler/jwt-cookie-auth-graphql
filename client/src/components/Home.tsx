import { useApolloClient } from "@apollo/client";
import React, { FC, useEffect } from "react";
import { useLogoutMutation, useMeQuery } from "../codeGenFE";
import { deleteUser } from "../utilsFE/tempToken";

const Home: FC = () => {
  const [logout] = useLogoutMutation();
  const apollo = useApolloClient();
  const { data, loading, error } = useMeQuery({});

  useEffect(() => {
    console.log("data", data);
  }, [data]);

  if (loading) {
    return <div>loading...</div>;
  }

  if (error) {
    return <div>Error {error}</div>;
  }

  return (
    <div>
      HOME PAGE
      <p>{data?.me?.username}</p>
      <button
        onClick={async () => {
          await logout();
          deleteUser();
          apollo.cache.evict({ fieldName: "User" });
          apollo.cache.gc();
        }}>
        Logout
      </button>
    </div>
  );
};

export default Home;
