const mongoose = require('mongoose');

const RepairGuideSchema = new mongoose.Schema({
  modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeviceModel', required: true },
  problemTitle: { type: String, required: true },
  categoryId: { type: String, required: true },
  description: { type: String },
  difficulty: { type: String, enum: ['facil', 'medio', 'dificil'], default: 'medio' },
  requiredTools: [{ type: String }],
  voltageTests: [{
    lineName: String,
    expectedVoltage: String,
    status: String
  }],
  videoUrl: { type: String },
  boardDiagramData: { type: mongoose.Schema.Types.Mixed },

  // Structured Technical Info
  classicSymptoms: { type: String },
  circuitAnalysis: { type: String },
  identifiedCause: { type: String },
  appliedSolution: { type: String },
  observations: { type: String },

  steps: [{
    order: Number,
    title: String,
    description: String,
    image: String,
    // Risk level for this step
    riskLevel: { type: String, default: 'low' },
    // Tools required for this step
    tools: [{ type: String }],
    // Checklist items for this step
    checklist: [{
      id: String,
      text: String,
      done: { type: Boolean, default: false }
    }]
  }],

  // PCB board pin markers — stored with native SVG coordinates (same system as SvgCanvas)
  pins: [{
    id: String,
    svgX: Number,   // native SVG coordinate
    svgY: Number,   // native SVG coordinate
    x: Number,      // legacy percentage (kept for backward compat)
    y: Number,      // legacy percentage (kept for backward compat)
    stepIndex: Number,
    label: String
  }],

  highlightedComponentIds: [{ type: String }],
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  // Allow extra fields without strict rejection
  strict: false
});

module.exports = mongoose.model('RepairGuide', RepairGuideSchema);
