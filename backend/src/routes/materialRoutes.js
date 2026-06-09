const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/materialController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.get('/', protect, ctrl.getMaterials);
router.get('/subjects', protect, ctrl.getSubjects);
router.post('/', protect, authorize('sir'), upload.single('file'), ctrl.createMaterial);
router.patch('/:id/bookmark', protect, ctrl.toggleBookmark);
router.put('/:id', protect, authorize('sir'), ctrl.updateMaterial);
router.delete('/:id', protect, authorize('sir'), ctrl.deleteMaterial);

module.exports = router;
