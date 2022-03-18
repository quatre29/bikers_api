export type User = {
  username: string;
  avatar: string;
  name: string;
  email?: string;
  location?: string;
  role: string;
  created_at: Date;
};

export type BlogPost = {
  title: string;
  body: string;
  author: string;
  post_banner: string;
  tags: string[];
  created_at: Date;
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
  user: string;
  rating: string;
};
