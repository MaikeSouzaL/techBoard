const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/GuideController');

router.get('/', ctrl.getGuides);
router.post('/', ctrl.createGuide);
router.get('/:id', ctrl.getGuide);
router.put('/:id', ctrl.updateGuide);
router.delete('/:id', ctrl.deleteGuide);

module.exports = router;
