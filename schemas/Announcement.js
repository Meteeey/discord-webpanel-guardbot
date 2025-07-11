const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  guildID: { type: String, required: true, unique: true },
  channelID: { type: String, default: null },
  message: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Announcement', announcementSchema);
