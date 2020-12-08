const { AuthenticationError } = require("apollo-server-express");
const isEmpty = require("lodash/isEmpty");

async function login(_, { username, password }) {
  const user = await users.get({ email, username });
  if (!user) return null;

  const passwordValid = await validatePassword(password, user.password);
  if (!passwordValid) return null;

  return setTokens(user);
}

async function loggedInUser(_, __, { req }) {
  if (isEmpty(req.user)) throw new AuthenticationError("Must autheticate");
  const user = await users.get({ userId: req.user.id });
  return user;
}
