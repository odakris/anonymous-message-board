const mongoose = require("mongoose");

const dbconnection = mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = dbconnection;
