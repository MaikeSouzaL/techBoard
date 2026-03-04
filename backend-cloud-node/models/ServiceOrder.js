const mongoose = require('mongoose');

const ServiceOrderSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  osNumber: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeviceModel' },
  
  // Device Checkin
  deviceSerial: { type: String },
  deviceColor: { type: String },
  deviceStorageSize: { type: String },
  devicePassword: { type: String },
  deviceCondition: { type: String },
  entryPhotos: [{ type: String }],
  
  // Diagnostics
  defectReported: { type: String },
  technicalDiagnostic: { type: String },
  technicalChecklist: { type: Map, of: Boolean },
  defectIds: [{ type: String }],
  
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  
  // Workflow
  status: { type: String, default: 'aguardando' },
  priority: { type: String, default: 'normal' },
  
  // Financial
  quoteParts: [{
    partId: { type: mongoose.Schema.Types.ObjectId, ref: 'Part' },
    partName: String,
    qty: Number,
    unitPrice: Number
  }],
  laborCost: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  quoteTotal: { type: Number, default: 0 },
  
  // Dates
  quoteSentAt: { type: Date },
  quoteApprovedAt: { type: Date },
  warrantyDays: { type: Number, default: 90 },
  warrantyExpiresAt: { type: Date },
  notes: { type: String },
  entryDate: { type: Date, default: Date.now },
  completedDate: { type: Date },
  deliveredDate: { type: Date },
  
}, { timestamps: true });

module.exports = mongoose.model('ServiceOrder', ServiceOrderSchema);
