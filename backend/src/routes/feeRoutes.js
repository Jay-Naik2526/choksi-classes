const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/feeController');

router.get('/', protect, ctrl.getFees);
router.get('/analytics', protect, authorize('sir'), ctrl.getAnalytics);
router.post('/', protect, authorize('sir'), ctrl.createFee);
router.post('/bulk', protect, authorize('sir'), ctrl.bulkCreateFees);
router.post('/send-reminders', protect, authorize('sir'), ctrl.sendReminders);
router.patch('/update-overdue', protect, authorize('sir'), ctrl.updateOverdue);
router.patch('/:id/pay', protect, authorize('sir'), ctrl.markPaid);
router.get('/:id/invoice', protect, ctrl.generateInvoice);

module.exports = router;
