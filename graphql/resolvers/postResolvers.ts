// import { verify } from "jsonwebtoken";
import { ObjectID } from "mongodb";
import {withFilter} from 'graphql-subscriptions'
import {
  CreatePostRes,
  MutationResolvers,
  Post,
  QueryResolvers,
  SubscriptionResolvers,
} from "../../codeGenBE";
// import { setTokenCookies, setTokens } from "../../auth/authTokens";
// import { setTokens } from "../../auth/authTokens";
// import { COOKIE_NAME } from "../../constants";

interface Resolvers {
  Query: QueryResolvers;
  Mutation: MutationResolvers;
  Subscription: SubscriptionResolvers;
}

export const postResolvers: Resolvers = {
  Query: {
    post: async (_, { id }, { db }, __): Promise<CreatePostRes> => {
      // const {id} = args;
      try {
        const newPost = await db
          .db("jwtCookie")
          .collection("posts")
          .findOne({ _id: new ObjectID(id) });
        if (!newPost) {
          return { error: { message: "No post found with that id" } };
        }
        console.log("newPost", newPost);
        return { post: newPost };
      } catch (err) {
        console.log("err");
        return { error: { message: "Something went wrong Internally" } };
      }
    },
  },
  Mutation: {
    createPost: async (_, { options }, { db }, ___): Promise<CreatePostRes> => {
      const { title, body } = options;
      try {
        if (!title) {
          return { errors: [{ source: "title", message: "Must enter title" }] };
        }
        if (!body) {
          return {
            errors: [{ source: "body", message: "Must enter body for post" }],
          };
        }
        const post = await db
          .db("jwtCookie")
          .collection("posts")
          .insertOne({ title, body });
        return { post: post.ops[0] };
      } catch (err) {
        console.log("err", err);
        return { error: { message: "Something went wrong internally." } };
      }
    },
  },
  Subscription: {
      postAdded: {
                subscribe: withFilter(
                  (_, args, {connection}) => connection.pubsub.asyncIterator(POST_ADDED), (payload, variables) => {
                  return payload.postAdded.id === variables.id
                })
  //       subscribe: (_, args, { connection }): Promise<Post> => {
  //         const POST_ADDED = "POST_ADDED"
  //         // console.log("connection from subscription", connection.context);
  //         console.log("connection from subscribe", connection);
  //         console.log("connection.context", connection.context);
  //         // if (!connection.context.req.session.userId) {
  //         // console.log("no user!!!!!! NOPE NOPE NOPE");
  //         // }
  //         // console.log("connection", connection);
  //         // console.log("connection", connection);
  //         // console.log("pubsub", connection.pubsub);
  //         // return connection.pubsub.asyncIterator(SOMETHING_CHANGED);
  //         if (args.userId === args.post._id) {
  //           return connection.pubsub.asyncIterator(POST_ADDED, args.post)
  //         }
  //       },
  //     },
  },
};
