const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { imageUpload: upload } = require('../middleware/upload');
const ctrl = require('../controllers/doubtController');

router.get('/', protect, ctrl.getDoubts);
router.get('/:id', protect, ctrl.getDoubt);
router.post('/', protect, authorize('student'), upload.single('image'), ctrl.submitDoubt);
router.put('/:id/answer', protect, authorize('sir'), upload.single('image'), ctrl.answerDoubt);
router.post('/:id/messages', protect, ctrl.addMessage);
router.delete('/:id', protect, authorize('student'), ctrl.deleteDoubt);

module.exports = router;
