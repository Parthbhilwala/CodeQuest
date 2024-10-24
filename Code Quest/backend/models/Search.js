const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  query: String,
  results: Array,
  cachedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Search', searchSchema);
