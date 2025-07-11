
const mongoose = require('mongoose');

const logEntrySchema = new mongoose.Schema({
  guildID: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LogEntry', logEntrySchema);
