const mongoose = require('mongoose');

const FinanceTransactionSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  type: { type: String, enum: ['INCOME', 'EXPENSE'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now, index: true },
  relatedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceOrder' },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, // Para comissões ou vales
  status: { type: String, enum: ['PENDENTE', 'PAGO'], default: 'PAGO' }
}, { timestamps: true });

module.exports = mongoose.model('FinanceTransaction', FinanceTransactionSchema);
