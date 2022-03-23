import express from "express";
import { createUser } from "../controllers/users.controllers";

const usersRouter = express.Router();

usersRouter.route("/").post(createUser);

export default usersRouter;
