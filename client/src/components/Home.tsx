import { useApolloClient } from "@apollo/client";
import React, { FC, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useLogoutMutation, useMeQuery } from "../codeGenFE";
// import { deleteUser } from "../utilsFE/tempToken";

interface Props {
  bearer: string | null | undefined;
}

const Home: FC = () => {
  const [logout, { client }] = useLogoutMutation({
    update: (cache, { data }) => {
      client.clearStore();
    },
  });
  const apollo = useApolloClient();
  const { data, loading, error } = useMeQuery();

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
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Home;
