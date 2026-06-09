const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/noticeController');

router.get('/', protect, ctrl.getNotices);
router.post('/:id/read', protect, ctrl.markRead);
router.post('/', protect, authorize('sir'), ctrl.createNotice);
router.put('/:id', protect, authorize('sir'), ctrl.updateNotice);
router.delete('/:id', protect, authorize('sir'), ctrl.deleteNotice);

module.exports = router;
