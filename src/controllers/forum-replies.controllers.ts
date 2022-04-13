import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import {
  deleteReply,
  insertNewReply,
  selectRepliesByTopic,
  selectReplyById,
  updateReply,
} from "../models/forum-replies.model";
import { checkIfRowExists } from "../utils/check";
import {
  validateNewReplyBody,
  validateRepliesByTopicBody,
  validateUpdateReplyBody,
} from "../utils/validate";

export const addReply = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { topic_id, body } = req.body;

    const validBody = validateNewReplyBody(topic_id, body);

    if (!validBody.valid) {
      return next(new AppError(validBody.msg!, 400));
    }

    const topic = await checkIfRowExists(topic_id, "forum_topics");

    if (!topic) {
      return next(new AppError("Not found", 404));
    }

    const reply = await insertNewReply(topic_id, body, req.user.username);

    res.status(200).send({ status: "success", data: { reply } });
  } catch (error) {
    next(error);
  }
};

export const editReply = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reply_id } = req.params;
    const { body } = req.body;

    const validBody = validateUpdateReplyBody(reply_id, body);

    if (!validBody.valid) {
      return next(new AppError(validBody.msg!, 400));
    }

    const oldReply = await checkIfRowExists(reply_id, "topic_replies");

    if (!oldReply) {
      return next(new AppError("Not found", 404));
    }

    const newReply = {
      ...oldReply,
      ...req.body,
    };

    let reply;

    if (
      oldReply.author === req.user.username ||
      req.user.role === "admin" ||
      req.user.role === "moderator"
    ) {
      reply = await updateReply(reply_id, newReply.body);
    } else {
      return next(
        new AppError("You don't have permission updating this reply", 403)
      );
    }

    res.status(200).send({ status: "success", data: { reply } });
  } catch (error) {
    next(error);
  }
};

export const removeReply = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reply_id } = req.params;

    const reply = await checkIfRowExists(reply_id, "topic_replies");

    if (!reply) {
      return next(new AppError("Not found", 404));
    }

    if (
      reply.author === req.user.username ||
      req.user.role === "admin" ||
      req.user.role === "moderator"
    ) {
      await deleteReply(reply_id);
    } else {
      return next(
        new AppError("You don't have permission deleting this reply", 403)
      );
    }

    res.status(204).send({ status: "success", msg: "Reply deleted" });
  } catch (error) {
    next(error);
  }
};

export const getReplyById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reply_id } = req.params;

    const reply = await selectReplyById(reply_id);

    res.status(200).send({ status: "success", data: { reply } });
  } catch (error) {
    next(error);
  }
};

export const getRepliesByTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { topic_id } = req.body;

    const validBody = validateRepliesByTopicBody(topic_id);

    if (!validBody.valid) {
      return next(new AppError(validBody.msg!, 400));
    }

    const topics = await selectRepliesByTopic(topic_id);

    res.status(200).send({ status: "success", data: { topics } });
  } catch (error) {
    next(error);
  }
};
