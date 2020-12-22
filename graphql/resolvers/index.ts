// All resolvers being used are imported here and turned into single reolvers

// array
import { mergeResolvers } from "@graphql-tools/merge";

import { userResolvers } from "./userResolvers";
import { postResolvers } from "./postResolvers";
import { authResolvers } from "./authResolvers";
const combinedResolvers = [userResolvers, postResolvers, authResolvers];

export const resolvers = mergeResolvers(combinedResolvers as []);
