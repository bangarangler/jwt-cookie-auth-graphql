const { ApolloServer } = requre("apollo-server-express");
const express = require("express");

const server = new ApolloServer({
  schema,
  context: ({ req, res }) => ({ req, res }),
});

const app = express();
app.use(validateTokenMiddleware);
server.applyMiddleWare({ app });
app.listen({ port: process.env.PORT }, () => {
  console.log(
    `Server ready at http://localhost:${process.env.PORT}${apolloServer.graphqlPath}`
  );
});
