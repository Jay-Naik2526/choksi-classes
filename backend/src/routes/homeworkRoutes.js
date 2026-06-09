const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const { protect, authorize } = require('../middleware/auth');
const ctrl     = require('../controllers/homeworkController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/',           protect, ctrl.list);
router.get('/:id',        protect, ctrl.getOne);
router.post('/',          protect, authorize('sir'), ctrl.create);
router.patch('/:id',      protect, authorize('sir'), ctrl.update);
router.delete('/:id',     protect, authorize('sir'), ctrl.remove);
router.post('/:id/submit',protect, authorize('student'), upload.single('file'), ctrl.submit);
router.patch('/:id/grade/:studentId', protect, authorize('sir'), ctrl.grade);

module.exports = router;
