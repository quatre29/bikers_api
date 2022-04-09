import express from "express";
import usersRouter from "./users.routes";
import blogPostsRouter from "./blog-posts.routes";
import forumsRouter from "./forums.routes";

const apiRouter = express.Router();

apiRouter.use("/users", usersRouter);
apiRouter.use("/blog-posts", blogPostsRouter);
apiRouter.use("/forum", forumsRouter);

export default apiRouter;
