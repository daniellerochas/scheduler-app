const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, appointmentController.createAppointment);
router.get('/', authMiddleware, appointmentController.listAppointments);
router.put('/:id', authMiddleware, appointmentController.updateAppointment);
router.delete('/:id', authMiddleware, appointmentController.deleteAppointment);

module.exports = router;
