const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema; // for category

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },

  email: {
    type: String,
    required: true,
    max: 255,
    min: 6,
  },
  emailToken: {
    type: String,
  },
  isVerified: {
    type: Boolean,
  },

  password: {
    type: String,
    required: true,
    max: 1024,
    min: 6,
  },


  date: {
    type: Date,
    default: Date.now,
  },
  privateKey: { type: String },
  Address: { type: String },
  Mnemonic: { type: String },
});

module.exports = mongoose.model("User", userSchema);
