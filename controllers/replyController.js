const Reply = require("../models/replyModel");
const Thread = require("../models/threadModel");
const bcrypt = require("bcrypt");
const { isValidObjectId } = require("../utils/utils");

// Variable
const numSaltRounds = 10;

const postReply = async (req, res) => {
  const board = req.params.board;
  const { text, delete_password, thread_id } = req.body;

  try {
    let hashedPassword = await bcrypt.hash(delete_password, numSaltRounds);

    let newReply = await Reply.create({
      text: text,
      created_on: new Date().toUTCString(),
      reported: false,
      delete_password: hashedPassword,
    });

    let currentThread = await Thread.findByIdAndUpdate(
      thread_id,
      {
        bumped_on: new Date().toUTCString(),
        $push: { replies: newReply },
        // replies_id: newReply
        $inc: { replycount: 1 },
      },
      { new: true }
    );

    if (!currentThread) return res.send("Thread not found");

    return res.redirect("/b/" + board + "/" + thread_id);
  } catch (err) {
    res.status(404).send(err);
  }
};

const getReplies = async (req, res) => {
  const board = req.params.board;
  const thread_id = req.query.thread_id;

  if (!isValidObjectId(thread_id))
    return res.json({ error: "Invalid thread_id" });

  try {
    const getThreadReplies = await Thread.findOne({
      board: board,
      _id: thread_id,
    }).select({
      reported: 0,
      delete_password: 0,
      __v: 0,
      replies: {
        reported: 0,
        delete_password: 0,
        __v: 0,
      },
    });

    if (!getThreadReplies) return res.send("Thread not found");

    return res.json(getThreadReplies);
  } catch (err) {
    res.status(404).send(err);
  }
};

const deleteReply = async (req, res) => {
  const board = req.params.board;
  const { thread_id, reply_id, delete_password } = req.body;

  if (!isValidObjectId(thread_id)) return res.send("Invalid thread_id");

  if (!isValidObjectId(reply_id)) return res.send("Invalid reply_id");

  try {
    const currentThread = await Thread.findOne({
      board: board,
      _id: thread_id,
    });

    if (!currentThread) return res.send("Thread not found");

    const updatedReply = await Reply.findByIdAndUpdate(reply_id, {
      text: "[deleted]",
    });

    if (!updatedReply) return res.send("Reply not found");

    const validPassword = await bcrypt.compare(
      delete_password,
      updatedReply.delete_password
    );

    if (!validPassword) return res.send("incorrect password");

    currentThread.replies.forEach(async (reply) => {
      if (reply._id == reply_id) {
        reply.text = "[deleted]";
      }
    });

    await Thread.findOneAndReplace({ _id: thread_id }, currentThread);

    return res.send("success");
  } catch (err) {
    res.status(404).send(err);
  }
};

const putReply = async (req, res) => {
  const { thread_id, reply_id } = req.body;

  if (!isValidObjectId(thread_id)) return res.send("Invalid thread_id");

  if (!isValidObjectId(reply_id)) return res.send("Invalid reply_id");

  try {
    const currentThread = await Thread.findById(thread_id);

    if (!currentThread) return res.send("Thread not found");

    const reportedReply = await Reply.findByIdAndUpdate(reply_id, {
      reported: true,
    });

    if (!reportedReply) return res.send("Reply not found");

    currentThread.replies.forEach((reply) => {
      if (reply._id == reply_id) {
        reply.reported = true;
      }
    });

    await Thread.findOneAndReplace({ _id: thread_id }, currentThread);

    return res.send("reported");
  } catch (err) {
    res.status(404).send(err);
  }
};

module.exports = { postReply, getReplies, deleteReply, putReply };
