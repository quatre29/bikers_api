import express from "express";
import usersRouter from "./users.routes";
import blogPostsRouter from "./blog-posts.routes";

const apiRouter = express.Router();

apiRouter.use("/users", usersRouter);
apiRouter.use("/blog-posts", blogPostsRouter);

export default apiRouter;
