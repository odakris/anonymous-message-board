const Thread = require("../models/threadModel");
const bcrypt = require("bcrypt");
const { isValidObjectId } = require("../utils/utils");

// Variables
const numSaltRounds = 10;

const postThread = async (req, res) => {
  const board = req.params.board;
  const { text, delete_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(delete_password, numSaltRounds);

    await Thread.create({
      board: board,
      text: text,
      delete_password: hashedPassword,
    });

    return res.redirect("/b/" + board);
  } catch (err) {
    res.status(404).send(err);
  }
};

const getThread = async (req, res) => {
  const board = req.params.board;

  try {
    const thread10 = await Thread.find(
      { board: board }
      // { replies: { $slice: 3 } }
    )
      .sort({ bumped_on: -1 })
      .limit(10)
      .select({
        reported: 0,
        delete_password: 0,
        __v: 0,
        replies: {
          reported: 0,
          delete_password: 0,
          __v: 0,
        },
      });

    if (!thread10) return res.send("Thread not found");

    const thread10_filtered = thread10.map((item) => {
      item.replies = item.replies.slice(0, 3);
      return item;
    });

    return res.json(thread10_filtered);
  } catch (err) {
    res.status(404).send(err);
  }
};

const deleteThread = async (req, res) => {
  const board = req.params.board;
  const { thread_id, delete_password } = req.body;

  if (!isValidObjectId(thread_id)) return res.send("Invalid thread_id");

  try {
    const threadToDelete = await Thread.findById(thread_id);

    if (!threadToDelete) return res.send("Thread not found");

    const validPassword = await bcrypt.compare(
      delete_password,
      threadToDelete.delete_password
    );

    if (!validPassword) return res.send("incorrect password");

    await Thread.deleteOne({ _id: thread_id });

    return res.send("success");
  } catch (err) {
    res.status(404).send(err);
  }
};

const putThread = async (req, res) => {
  const { thread_id } = req.body;

  if (!isValidObjectId(thread_id)) return res.send("Invalid thread_id");

  try {
    const reportedThread = await Thread.findByIdAndUpdate(thread_id, {
      reported: true,
    });

    if (!reportedThread) return res.send("Thread not found");

    return res.send("reported");
  } catch (err) {
    res.status(404).send(err);
  }
};

module.exports = { postThread, getThread, deleteThread, putThread };
