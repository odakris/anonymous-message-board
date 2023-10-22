const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Reply = require("./replyModel");

const threadSchema = new Schema({
  board: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  created_on: {
    type: String,
    required: true,
    default: () => new Date().toUTCString(),
  },
  bumped_on: {
    type: String,
    required: true,
    default: () => new Date().toUTCString(),
  },
  delete_password: {
    type: String,
    required: true,
  },
  reported: {
    type: Boolean,
    required: true,
    default: false,
  },
  replycount: {
    type: Number,
    required: true,
    default: 0,
  },
  // replies: [Reply.schema], // Embed the reply schema directly
  // replies_id: [{
  //   type: [Schema.Types.ObjectId],
  //   ref: 'Reply',
  // }],
  replies: {
    type: Array,
    value: [Reply],
  },
});

const Thread = mongoose.model("Thread", threadSchema);

module.exports = Thread;
