const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    street: { type: String, trim: true },
    price: { type: Number, required: true },
    rooms: { type: String },
    available: { type: String },
    gender: { type: String },
    pets: { type: Boolean, default: false },
    smoking: { type: Boolean, default: false },
    students: { type: Boolean, default: false },
    furnished: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Apartment', apartmentSchema);
