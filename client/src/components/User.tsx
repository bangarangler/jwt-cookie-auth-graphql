// import { useApolloClient } from "@apollo/client";
import React, { FC } from "react";
import {
  useMeQuery,
  // MeQuery,
  // MeQueryVariables,
  // MeDocument,
} from "../codeGenFE";
// import Me from  "../codeGenFE/queries/me.graphql"

const User: FC = () => {
  const { data, loading, error } = useMeQuery();
  // const client = useApolloClient();
  // const [user, setUser] = useState("");
  // const { username } = data?.me

  // useEffect(() => {
  // const user = client.readQuery<MeQuery, MeQueryVariables>({
  //   query: MeDocument,
  // });
  // console.log("user", user);
  // client.writeQuery<MeQuery, MeQueryVariables>({
  //   query: MeDocument,
  //   data: {
  //     me: { _id: "", username: "", tokenVersion: null },
  //   },
  // });
  //   setUser(data.me.username);
  // } else {
  //   setUser("");
  // }
  // }, [data]);

  if (loading) {
    return <div>loading...</div>;
  }

  if (error) {
    console.log("error", error);
    return <p>"Sorry there was an error"</p>;
  }

  if (!loading && !data?.me?.user?.username) return null;

  return <div>User: {data?.me?.user?.username}</div>;
};

export default User;
