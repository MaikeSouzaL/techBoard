const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/BrandController');
// const { protect } = require('../middlewares/authMiddleware'); // Opcional por enquanto

router.get('/', ctrl.getBrands);
router.post('/', ctrl.createBrand);
router.get('/:id', ctrl.getBrand);
router.put('/:id', ctrl.updateBrand);
router.delete('/:id', ctrl.deleteBrand);

module.exports = router;
