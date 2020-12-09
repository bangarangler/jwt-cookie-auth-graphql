export const loginValidation = (un: string, pw: string) => {
  let errors = [];
  if (!pw)
    errors.push({ source: "password", message: "Must enter a Password" });
  if (!un)
    errors.push({ source: "username", message: "Must enter a User Name" });
  return errors;
};
