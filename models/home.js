const mongoose = require('mongoose');
const homeSchema = new mongoose.Schema({
  houseName: { type: String, required: true, trim: true, maxlength: 100 },
  Price: { type: Number, required: true, min: 1 },
  Location: { type: String, required: true, trim: true, maxlength: 120 },
  rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
  photo: { type: String, required: true, default: '/images/house1.png' },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }
}, { timestamps: true });
module.exports = mongoose.models.Home || mongoose.model('Home', homeSchema);

