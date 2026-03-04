const mongoose = require('mongoose');

const PartSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  name: { type: String, required: true },
  code: { type: String },
  supplier: { type: String },
  costPrice: { type: Number, default: 0 },
  sellPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 5 },
  brandIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }]
}, { timestamps: true });

module.exports = mongoose.model('Part', PartSchema);
