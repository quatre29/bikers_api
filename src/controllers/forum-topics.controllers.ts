import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import {
  deleteTopic,
  getAllTopics,
  insertNewTopic,
  InsertNewVoteTopic,
  selectMyTopicVote,
  selectTopicById,
  selectTopicsByForum,
  updateLockTopic,
  updateTopic,
} from "../models/forum-topics.model";
import { checkIfRowExists } from "../utils/check";
import {
  validateLockTopicBody,
  validateNewTopicBody,
  validateUpdateTopicBody,
  validateVoteTopicBody,
} from "../utils/validate";

export const createNewTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { forum_id } = req.params;
    const { title, pinned, body } = req.body;

    const validPinnedProp =
      req.user.role === "admin" || req.user.role === "moderator"
        ? pinned
        : false;

    const validateBody = validateNewTopicBody(
      title,
      validPinnedProp,
      body,
      forum_id
    );

    if (!validateBody.valid) {
      return next(new AppError(validateBody.msg!, 400));
    }

    const forum = await checkIfRowExists(forum_id, "forums");

    if (!forum) {
      return next(new AppError("Not found", 404));
    }

    const topic = await insertNewTopic(
      forum_id,
      title,
      validPinnedProp,
      body,
      req.user.username
    );

    res.status(201).send({ status: "success", data: { topic } });
  } catch (error) {
    next(error);
  }
};

export const getTopicById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { topic_id } = req.params;

    const topic = await selectTopicById(topic_id);

    res.status(200).send({ status: "success", data: { topic } });
  } catch (error) {
    next(error);
  }
};

export const getTopicsByForumId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { forum_id } = req.params;

    const validForum = await checkIfRowExists(forum_id, "forums");

    if (!validForum) {
      return next(new AppError("Not found", 404));
    }

    const topics = await selectTopicsByForum(forum_id);

    res.status(200).send({ status: "success", data: { topics } });
  } catch (error) {
    next(error);
  }
};

export const removeTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { topic_id } = req.params;

    const validTopic = await checkIfRowExists(topic_id, "forum_topics");

    if (!validTopic) {
      return next(new AppError("Not found", 404));
    }

    if (
      validTopic.author === req.user.username ||
      req.user.role === "admin" ||
      req.user.role === "moderator"
    ) {
      await deleteTopic(topic_id);
    } else {
      return next(
        new AppError("You don't have permission deleting this topic", 403)
      );
    }

    res.status(204).send({ status: "success", msg: "Topic removed" });
  } catch (error) {
    next(error);
  }
};

export const editTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { topic_id } = req.params;
    const { title, pinned, body } = req.body;

    const oldTopic = await checkIfRowExists(topic_id, "forum_topics");

    if (!oldTopic) {
      return next(new AppError("Not found", 404));
    }

    const validPinnedProp =
      req.user.role === "admin" || req.user.role === "moderator"
        ? pinned
        : oldTopic.pinned;

    const validBody = validateUpdateTopicBody(title, validPinnedProp, body);

    if (!validBody.valid) {
      return next(new AppError(validBody.msg!, 400));
    }

    const newTopic = {
      ...oldTopic,
      ...req.body,
      pinned: validPinnedProp,
    };

    let topic;

    if (
      oldTopic.author === req.user.username ||
      req.user.role === "admin" ||
      req.user.role === "moderator"
    ) {
      topic = await updateTopic(
        topic_id,
        newTopic.title,
        validPinnedProp,
        newTopic.body
      );
    } else {
      return next(
        new AppError("You don't have permission updating this topic", 403)
      );
    }

    res.status(200).send({ status: "success", data: { topic } });
  } catch (error) {
    next(error);
  }
};

export const _getALlTopics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const topics = await getAllTopics();

    res.status(200).send({ status: "success", data: { topics } });
  } catch (error) {
    next(error);
  }
};

export const lockTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { topic_id } = req.params;
    const { locked } = req.body;

    const oldTopic = await checkIfRowExists(topic_id, "forum_topics");

    if (!oldTopic) {
      return next(new AppError("Not found", 404));
    }

    const validBody = validateLockTopicBody(locked);

    if (!validBody.valid) {
      return next(new AppError(validBody.msg!, 400));
    }

    const topic = await updateLockTopic(topic_id, locked);

    res.status(200).send({ status: "success", data: { topic } });
  } catch (error) {
    next(error);
  }
};

export const voteTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { topic_id } = req.params;
    const { vote } = req.body;

    const validBody = validateVoteTopicBody(vote);

    if (!validBody.valid) {
      return next(new AppError(validBody.msg!, 400));
    }

    const topic = await InsertNewVoteTopic(topic_id, req.user.user_id, vote);

    res.status(200).send({ status: "success", data: { topic } });
  } catch (error) {
    next(error);
  }
};

export const getMyTopicVote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { topic_id } = req.params;

    const vote = await selectMyTopicVote(topic_id, req.user.user_id);

    res.status(200).send({ status: "success", data: { vote } });
  } catch (error) {
    next(error);
  }
};
