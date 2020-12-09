export const registerValidation = (un: string, pw: string, cpw: string) => {
  let errors = [];
  if (!pw)
    errors.push({ source: "password", message: "Must enter a Password" });
  if (!cpw)
    errors.push({
      source: "confirmPassword",
      message: "Must enter a Confirm Password",
    });
  if (!un)
    errors.push({ source: "username", message: "Must enter a User Name" });
  if (pw.toString().trim() !== cpw.toString().trim())
    errors.push({ source: "bad match", message: "passwords do not match" });
  return errors;
};
