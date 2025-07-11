
const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  guildID: String,
  channelID: String
});
module.exports = mongoose.model("logChannel", schema);
