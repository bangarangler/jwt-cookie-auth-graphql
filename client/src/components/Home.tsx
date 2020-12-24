import { useApolloClient } from "@apollo/client";
import React, { FC, useEffect } from "react";
import { useLogoutMutation, useMeQuery } from "../codeGenFE";
// import { deleteUser } from "../utilsFE/tempToken";

interface Props {
  bearer: string | null | undefined;
}

const Home: FC = () => {
  const [logout] = useLogoutMutation();
  const apollo = useApolloClient();
  const { data, loading, error } = useMeQuery();

  useEffect(() => {
    console.log("// ============= HOME ============= //");
    console.log("data", data);
    console.log("loading", loading);
    console.log("error", error);
    console.log("// ============= END HOME ============= //");
  }, [data, loading, error]);

  if (loading) {
    // console.log("loading...");
    return <div>loading...</div>;
  }

  if (error) {
    // console.log("err", error);
    return <div>Error </div>;
  }

  return (
    <div>
      HOME PAGE
      <p>{data?.me?.user?.username}</p>
      <button
        onClick={async () => {
          await logout();
          // deleteUser();
          apollo.cache.evict({ fieldName: "User" });
          apollo.cache.gc();
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Home;
