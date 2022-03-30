import Joi from "joi";
import {
  BlogPost,
  UpdateBlogPost,
  User,
  UserRole,
} from "../data-types/dataTypes";

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

export const validateBlogPostSchema = (blogPost: BlogPost): ValidatorType => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(255).required(),
    body: Joi.string().min(3).required(),
    tags: Joi.array(),
    post_banner: Joi.string().allow(null),
    author: Joi.string().alphanum().min(3).max(30).required(),
  });

  const validator = schema.validate(blogPost);
  if (validator.error) return { valid: false, msg: validator.error.message };
  return { valid: true };
};

export const validateRoleSchema = (role: UserRole) => {
  const schema = Joi.string().valid("admin", "moderator", "member").required();

  const validator = schema.validate(role);

  if (validator.error) return { valid: false, msg: validator.error.message };
  return { valid: true };
};

export const validateRatingSchema = (rating: number) => {
  const schema = Joi.number()
    .precision(1)
    .positive()
    .min(0.5)
    .max(5)
    .required();

  const validator = schema.validate(rating, { convert: true });

  if (validator.error)
    return {
      valid: false,
      msg: validator.error.message,
    };

  return { valid: true, value: validator.value };
};

export const validateUpdateBlogPostSchema = (updates: UpdateBlogPost) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(255),
    body: Joi.string().min(3),
    tags: Joi.array(),
    post_banner: Joi.string().allow(null),
  });

  const validator = schema.validate(updates);

  if (validator.error)
    return {
      valid: false,
      msg: validator.error.message,
    };

  return { valid: true };
};
