const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  home: { type: mongoose.Schema.Types.ObjectId, ref: 'Home', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true, min: 1, max: 16 },
  totalPrice: { type: Number, required: true, min: 1 }
}, { timestamps: true });
module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
