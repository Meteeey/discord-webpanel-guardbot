const mongoose = require("mongoose");

const safeSchema = new mongoose.Schema({
  guildID: {
    type: String,
    required: true,
    unique: true
  },
  guardEnabled: {
    type: Boolean,
    default: false
  },
  safeUsers: [
    {
      id: { type: String },
      addedAt: { type: Date, default: Date.now }
    }
  ],
  bannedCount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Safe", safeSchema);
