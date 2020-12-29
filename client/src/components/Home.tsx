import { useApolloClient } from "@apollo/client";
import React, { FC, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useLogoutMutation, useMeQuery } from "../codeGenFE";
import { useUserContext } from "../context/allContexts";
// import { deleteUser } from "../utilsFE/tempToken";

interface Props {
  bearer: string | null | undefined;
  resetMemToken: () => void;
}

const Home: FC<Props> = ({ resetMemToken }) => {
  const history = useHistory();
  const { userState, userDispatch } = useUserContext();
  const [logout, { client }] = useLogoutMutation({
    update: async (cache, { data }) => {
      resetMemToken();
      userDispatch({ type: "logout" });
      // write to store here make user null possible move token stuff? find
      // better example
      // await client.clearStore();
      history.push("/login");
    },
  });
  useEffect(() => {
    console.log(userState);
  }, [userState]);
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
      <p>{userState?.user?.username}</p>
      <button
        onClick={async () => {
          await logout();
        }}>
        Logout
      </button>
    </div>
  );
};

export default Home;
