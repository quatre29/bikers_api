import Joi, { string } from "joi";
import { User } from "../data-types/dataTypes";

type ValidatorType = {
  valid: boolean;
  msg?: string;
};

export const validateUserSchema = (user: User): ValidatorType => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().required(),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .required(),
    location: Joi.string().min(2).max(100),
    role: Joi.string().valid("member", "moderator", "admin"),
    avatar: Joi.string(),
    name: Joi.string().min(3).max(50),
  });

  const validator = schema.validate(user);

  if (validator.error) return { valid: false, msg: validator.error.message };
  return { valid: true };
};
