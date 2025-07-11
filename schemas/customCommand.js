const mongoose = require('mongoose');

const customCommandSchema = new mongoose.Schema({
  guildID: String,
  command: String,
  type: String, 
  response: String,
  imageUrl: String,
  embedTitle: String,
  embedColor: String,
  embedFooter: String,
  embedThumbnail: String
});

module.exports = mongoose.model('CustomCommand', customCommandSchema);
