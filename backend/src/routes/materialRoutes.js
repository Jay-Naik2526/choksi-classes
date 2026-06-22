const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { materialUpload: upload } = require('../middleware/upload');
const ctrl = require('../controllers/materialController');

router.get('/', protect, ctrl.getMaterials);
router.get('/subjects', protect, ctrl.getSubjects);
router.get('/batch-groups', protect, ctrl.getBatchGroups);
router.post('/', protect, authorize('sir'), upload.single('file'), ctrl.createMaterial);
router.patch('/:id/bookmark', protect, ctrl.toggleBookmark);
router.put('/:id', protect, authorize('sir'), ctrl.updateMaterial);
router.delete('/:id', protect, authorize('sir'), ctrl.deleteMaterial);

module.exports = router;

