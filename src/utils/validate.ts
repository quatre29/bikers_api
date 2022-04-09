import Joi from "joi";
import { join } from "path";
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

const validate = (schema: any, validationObj: any) => {
  const validator = schema.validate(validationObj);

  if (validator.error)
    return {
      valid: false,
      msg: validator.error.message,
    };

  return { valid: true };
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

  return validate(schema, user);
};

export const validateBlogPostSchema = (blogPost: BlogPost): ValidatorType => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(255).required(),
    body: Joi.string().min(3).required(),
    tags: Joi.array(),
    post_banner: Joi.string().allow(null),
    author: Joi.string().alphanum().min(3).max(30).required(),
  });

  return validate(schema, blogPost);
};

export const validateRoleSchema = (role: UserRole) => {
  const schema = Joi.string().valid("admin", "moderator", "member").required();

  return validate(schema, role);
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

  return validate(schema, updates);
};

export const validateNewForumCategoryBody = (
  name: string,
  admin_only: boolean
) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    admin_only: Joi.boolean(),
  });

  return validate(schema, { name, admin_only });
};

export const validateUpdateForumCategoryBody = (
  name: string,
  admin_only: boolean
) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50),
    admin_only: Joi.boolean(),
  });

  return validate(schema, { name, admin_only });
};

export const validateNewForum = (
  name: string,
  description: string,
  parent_forum_id?: string
) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().max(255),
    parent_forum_id: Joi.number(),
  });

  return validate(schema, { name, description, parent_forum_id });
};

export const validateForumUpdateBody = (
  name: string,
  description: string,
  parent_forum_id: string,
  category_id: string
) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50),
    description: Joi.string().max(255),
    parent_forum_id: Joi.number(),
    category_id: Joi.number(),
  });

  return validate(schema, { name, description, parent_forum_id, category_id });
};
