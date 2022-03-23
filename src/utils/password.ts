import bcrypt from "bcrypt";

export const encryptPassword = async (passwordString: string) => {
  const password = await bcrypt.hash(passwordString, 12);
  return password;
};

export const validatePassword = async (entered: string, encrypted: string) => {
  const result = await bcrypt.compare(entered, encrypted);

  return result ? true : false;
};
