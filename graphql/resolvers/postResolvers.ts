// import { verify } from "jsonwebtoken";
import { ObjectID } from "mongodb";
import { withFilter } from "graphql-subscriptions";
import {
  CreatePostRes,
  MutationResolvers,
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

const POST_ADDED = "POST_ADDED";
const POST_UPDATED = "POST_UPDATED";

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
    createPost: async (
      _,
      { options },
      { db, pubsub },
      ___
    ): Promise<CreatePostRes> => {
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
        console.log("publishing Post");
        pubsub.publish(POST_ADDED, { postAdded: post.ops[0] });
        return { post: post.ops[0] };
      } catch (err) {
        console.log("err", err);
        return { error: { message: "Something went wrong internally." } };
      }
    },
    updatePost: async (
      _,
      { updates },
      { db, pubsub },
      ___
    ): Promise<CreatePostRes> => {
      const { _id, title, body } = updates;
      const errors = [];
      try {
        if (!_id) {
          return { error: { message: "Must provide and post id" } };
        }
        if (title === "") {
          errors.push({ source: "title", message: "Title can't be empty" });
        }
        if (body === "") {
          errors.push({ source: "body", message: "Body can't be empty" });
        }
        if (errors.length > 0) {
          return { errors };
        }
        // console.log("postToBeUpdated", postToBeUpdated);
        const updatedPost = await db
          .db("jwtCookie")
          .collection("posts")
          .findOneAndUpdate(
            { _id: new ObjectID(_id) },
            { $set: { title: title, body: body } },
            {
              returnOriginal: false,
            }
          );
        if (!updatedPost.value) {
          return { error: { message: "Error updating the Post" } };
        }
        pubsub.publish(POST_UPDATED, {
          postUpdated: { post: updatedPost.value },
        });
        return { post: updatedPost.value };
      } catch (err) {
        console.log("err", err);
        return { error: { message: "Something went wrong internally" } };
      }
    },
  },
  Subscription: {
    postAdded: {
      subscribe: (_, __, { connection }) => {
        return connection.pubsub.asyncIterator(POST_ADDED);
      },
    },
    postUpdated: {
      subscribe: withFilter(
        (_, __, { connection }) => {
          return connection.pubsub.asyncIterator(POST_UPDATED);
        },
        (payload, variables) => {
          if (
            payload.postUpdated.post._id.toString() ===
            variables.postId.toString()
          ) {
            return true;
          }
          return false;
        }
      ),
    },
  },
};
