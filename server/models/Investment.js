const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  farm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
  },
  investor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true, // total amount invested
  },
  sharePercentage: {
    type: Number,
    required: true, // % of farm profit this investor is entitled to, e.g. 20 for 20%
    min: 0,
    max: 100,
  },
  investmentDate: {
    type: Date,
    required: true,
  },
  nextPayoutDate: {
    type: Date,
  },
}, { timestamps: true });

// One investor can only have one investment record per farm
investmentSchema.index({ farm: 1, investor: 1 }, { unique: true });

module.exports = mongoose.model('Investment', investmentSchema);