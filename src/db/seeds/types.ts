export type User = {
  username: string;
  avatar: string;
  name: string;
  email?: string;
  location?: string;
  role: string;
  password: string;
  created_at: Date;
};

export type BlogPost = {
  title: string;
  body: string;
  author: string;
  author_id: string;
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
  author: string;
  rating: number;
};

export type ForumCategory = {
  name: string;
  admin_only?: boolean;
};

export type Forum = {
  name: string;
  description: string;
  category_id: number;
};

export type SubForum = {
  name: string;
  description: string;
  parent_forum_id: number;
};

export type Topic = {
  title: string;
  forum_id: number;
  author: string;
  pinned: boolean;
  body: string;
};

export type Reply = {
  author: string;
  quote_body: null | string;
  body: string;
  topic_id: number;
};
