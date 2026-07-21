const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  farm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },
  product: {
    type: String,
    required: true, // e.g. "Maize", "Tomatoes"
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    default: 'units',
  },
  customer: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true, // total sale amount, in your currency
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);