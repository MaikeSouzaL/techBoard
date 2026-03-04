const DeviceModel = require('../models/DeviceModel');

exports.getModels = async (req, res) => {
  try {
    const q = req.query.brandId ? { brandId: req.query.brandId } : {};
    const models = await DeviceModel.find(q).sort({ name: 1 });
    res.json(models);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getModelById = async (req, res) => {
  try {
    const model = await DeviceModel.findById(req.params.id);
    if (!model) return res.status(404).json({ message: 'Model not found' });
    res.json(model);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createModel = async (req, res) => {
  try {
    const model = new DeviceModel(req.body);
    const saved = await model.save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateModel = async (req, res) => {
  try {
    const body = req.body;
    const $set = {};
    const $unset = {};
    for (const [k, v] of Object.entries(body)) {
      if (v === null || v === '') $unset[k] = '';
      else $set[k] = v;
    }
    const update = {};
    if (Object.keys($set).length) update.$set = $set;
    if (Object.keys($unset).length) update.$unset = $unset;
    const updated = await DeviceModel.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteModel = async (req, res) => {
  try {
    await DeviceModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
