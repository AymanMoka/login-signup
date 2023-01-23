const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  username: { type: String },
  email: { type: String },
  password: { type: String },
  phone: { type: Number },
  photo: { type: String },
});

module.exports = mongoose.model("User", userSchema);
