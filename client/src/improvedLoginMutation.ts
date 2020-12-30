import gql from "graphql-tag";
import { useMutation } from "@apollo/client";
// import { useLoginMutation } from "./codeGenFE";
import { useAuthToken } from "./authToken";
import { UserLoginInput } from "./codeGenFE";

export const imporvedLoginMutation = gql`
  mutation Login($input: UserLoginInput!) {
    login(input: $input) {
      error {
        message
      }
      errors {
        source
        message
      }
      user {
        ...UserFrag
      }
      accessToken
    }
  }
`;

export const useImprovedLoginMutation = () => {
  const [, setAuthToken] = useAuthToken();

  const [mutation, mutationResults] = useMutation(imporvedLoginMutation, {
    update: (cache, { data }) => {
      setAuthToken(data?.login?.accessToken);
    },
    // onCompleted: (data) => {
    //   setAuthToken(data?.login?.accessToken);
    // },
  });
  // const [mutation, mutationResults] = useLoginMutation({
  //   onCompleted: (data) => {
  //     setAuthToken(data?.login?.accessToken);
  //   },
  // });

  const login = (input: UserLoginInput) => {
    return mutation({
      variables: {
        input: { username: input.username, password: input.password },
      },
    });
  };
  return [login, mutationResults];
};
