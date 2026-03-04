const RepairGuide = require('../models/RepairGuide');

exports.getGuides = async (req, res) => {
  try {
    const q = req.query.modelId ? { modelId: req.query.modelId } : {};
    const guides = await RepairGuide.find(q).sort({ problemTitle: 1 });
    res.json(guides);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getGuide = async (req, res) => {
  try {
    const guide = await RepairGuide.findById(req.params.id);
    if (!guide) return res.status(404).json({ message: 'Not found' });
    res.json(guide);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createGuide = async (req, res) => {
  try {
    const guide = new RepairGuide(req.body);
    const saved = await guide.save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateGuide = async (req, res) => {
  try {
    req.body.updatedAt = Date.now();
    const updated = await RepairGuide.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteGuide = async (req, res) => {
  try {
    await RepairGuide.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
