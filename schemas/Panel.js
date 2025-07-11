const mongoose = require("mongoose");

const panelSchema = new mongoose.Schema({
  guildID: { type: String, required: true },
  kanalKoruma: { type: Boolean, default: false },
  rolKoruma: { type: Boolean, default: false },
  emojiKoruma: { type: Boolean, default: false },
  banKickKoruma: { type: Boolean, default: false },

});

module.exports = mongoose.model("Panel", panelSchema);
