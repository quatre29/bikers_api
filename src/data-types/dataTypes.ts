export type User = {
  user_id?: number;
  username: string;
  avatar?: string;
  name: string;
  email: string;
  location?: string;
  role?: string;
  password?: string;
  created_at?: Date;
  active?: Boolean;
};

export type FilteringUsers = {
  location?: string;
  role?: "member" | "moderator" | "admin";
  name?: string;
  username?: string;
};

export type UpdateUser = {
  username?: string;
  avatar?: string;
  name?: string;
  email?: string;
  location?: string;
};

export type ReturnedUser = {
  user_id: number;
  username: string;
  avatar?: string;
  name: string;
  email: string;
  location?: string;
  role?: string;
  password?: string;
  created_at?: Date;
};

export type BlogPost = {
  title: string;
  body: string;
  author: string;
  post_banner?: string;
  description?: string;
  tags: string[];
  created_at?: Date;
};

export type UpdateBlogPost = {
  title?: string;
  body?: string;
  post_banner?: string;
  tags?: string[];
};

export type BlogPostComment = {
  author: string;
  body: string;
  post_id: number;
  created_at: Date;
};

export type Tag = {
  slug: string;
  description: string;
};

export type Rating = {
  location_id: number;
  author: string;
  rating: number;
};

export type LoginCredentials = {
  username: string;
  password: string;
};

export type UserRole = "admin" | "moderator" | "member";
