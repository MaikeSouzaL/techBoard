const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/DeviceModelController');

router.get('/', ctrl.getModels);
router.get('/:id', ctrl.getModelById);
router.post('/', ctrl.createModel);
router.put('/:id', ctrl.updateModel);
router.delete('/:id', ctrl.deleteModel);

module.exports = router;
