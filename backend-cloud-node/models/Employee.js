const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Opcional se for só registro de func sem acesso
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'tecnico', 'atendente', 'assinante_externo'], required: true },
  phone: { type: String },
  email: { type: String },
  commission: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
