"use strict";
const express = require("express");
const router = express.Router();

const threadController = require("../controllers/threadController");
const replyController = require("../controllers/replyController");

router
  .route("/api/threads/:board")
  .post(threadController.postThread) // Create a new thread
  .get(threadController.getThread) // Get threads
  .delete(threadController.deleteThread) // Delete a thread
  .put(threadController.putThread); // Update a thread (e.g., report it)

router
  .route("/api/replies/:board")
  .post(replyController.postReply) // Create a new reply
  .get(replyController.getReplies) // Get replies for a specific thread
  .delete(replyController.deleteReply) // Delete a reply
  .put(replyController.putReply); // Update a reply (e.g., report it)

module.exports = router;
