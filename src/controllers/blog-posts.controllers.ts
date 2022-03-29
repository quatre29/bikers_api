import { Request, Response, NextFunction } from "express";
import { selectAllBlogPosts } from "../models/blog-posts.model";

export const createBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {
    next(error);
  }
};

export const getAllBlogPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryParams = req.query;
    const page = queryParams["page"] as string;
    const limit = queryParams["limit"] as string;
    const title = queryParams["title"] as string;
    const author = queryParams["author"] as string;
    const tag = queryParams["tag"] as string;

    console.log(queryParams);

    const posts = await selectAllBlogPosts(page, limit, title, author, tag);

    res.status(200).send({ status: "success", data: { posts } });
  } catch (error) {
    next(error);
  }
};

export const getBlogPostById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {
    next(error);
  }
};

export const deleteBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {
    next(error);
  }
};

export const rateBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {
    next(error);
  }
};

export const editBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {
    next(error);
  }
};
