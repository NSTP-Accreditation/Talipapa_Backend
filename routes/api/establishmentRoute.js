const express = require('express');
const router = express.Router();

// Import controllers
const {
  createEstablishment,
  getAllEstablishments,
  getEstablishmentById,
  updateEstablishment,
  deleteEstablishment
} = require('../../controller/establishmentController');

// Routes
router.post('/', createEstablishment);
router.get('/', getAllEstablishments);
router.get('/:id', getEstablishmentById);
router.patch('/:id', updateEstablishment);
router.delete('/:id', deleteEstablishment);

module.exports = router;