const mongoose = require('mongoose');

const DeviceModelSchema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  name: { type: String, required: true },
  image: { type: String },
  pcbImageFront: { type: String },
  pcbImageBack: { type: String },
  pcbImageFrontClean: { type: String },
  pcbImageBackClean: { type: String },
  bgImage: { type: String },
  // PCB Editor drawing data: components, wires, etc.
  pcbData: { type: mongoose.Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeviceModel', DeviceModelSchema);
