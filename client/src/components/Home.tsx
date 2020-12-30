import React, { FC } from "react";
import User from "./User";
import { useHistory } from "react-router-dom";
import { useLogoutMutation } from "../codeGenFE";
import { useUserContext } from "../context/allContexts";

interface Props {}

const Home: FC<Props> = () => {
  const history = useHistory();
  const { userState, userDispatch } = useUserContext();
  const [logout, { client }] = useLogoutMutation({
    update: async (cache, { data }) => {
      userDispatch({ type: "logout" });
      await client.clearStore();
      history.push("/login");
    },
  });

  return (
    <div>
      HOME PAGE
      {userState?.user && <p>User: {userState.user.username}</p>}
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
