import React, { FC, useEffect } from "react";
import { useLogoutMutation, useMeQuery } from "../codeGenFE";
import { deleteUser } from "../utilsFE/tempToken";

const Home: FC = () => {
  const [logout] = useLogoutMutation();
  const { data, error, loading } = useMeQuery();

  useEffect(() => {
    console.log("data", data);
  }, [data]);

  if (loading) {
    return <div>loading...</div>;
  }

  if (error) {
    return <div>something wrong{error}</div>;
  }

  if (!loading && !data?.me) {
    return <div>you need to log in</div>;
  }

  return (
    <div>
      HOME PAGE
      <p>{data?.me?.username ? data.me.username : null}</p>
      {data?.me && (
        <button
          onClick={async () => {
            await logout();
            deleteUser();
          }}>
          Logout
        </button>
      )}
    </div>
  );
};

export default Home;
