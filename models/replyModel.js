const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const replySchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  created_on: {
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
});

const Reply = mongoose.model("Reply", replySchema);

module.exports = Reply;
