export type User = {
  username: string;
  avatar: string;
  name: string;
  email?: string;
  location?: string;
  role: string;
  created_at: Date;
};

export type BlogPosts = {
  title: string;
  body: string;
  author: string;
  post_banner: string;
  tags: string[];
  created_at: Date;
};
