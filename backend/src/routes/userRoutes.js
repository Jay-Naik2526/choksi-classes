const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/userController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/stats', protect, authorize('sir'), ctrl.getSirStats);
router.get('/my-stats', protect, authorize('student'), ctrl.getStudentStats);
router.get('/my-children', protect, authorize('parent'), ctrl.getMyChildren);

// Students
router.get('/students', protect, authorize('sir'), ctrl.getStudents);
router.post('/students', protect, authorize('sir'), ctrl.createStudent);
router.patch('/students/:id', protect, authorize('sir'), ctrl.updateStudent);
router.get('/students/:id/progress-report', protect, authorize('sir', 'parent', 'student'), ctrl.generateProgressReport);

// Sirs/Admins
router.get('/sirs', protect, authorize('sir'), ctrl.getSirs);
router.post('/sirs', protect, authorize('sir'), ctrl.createSir);
router.patch('/sirs/:id', protect, authorize('sir'), ctrl.updateSir);

// Batches
router.get('/batches', protect, ctrl.getBatches);
router.post('/batches', protect, authorize('sir'), ctrl.createBatch);
router.delete('/batches/:id', protect, authorize('sir'), ctrl.deleteBatch);

// Parents
router.get('/parents', protect, authorize('sir'), ctrl.getParents);
router.post('/parents', protect, authorize('sir'), ctrl.createParent);
router.patch('/parents/:id', protect, authorize('sir'), ctrl.updateParent);

// Referrals
router.get('/referrals', protect, authorize('sir'), ctrl.getReferrals);

// Profile
router.get('/profile', protect, ctrl.getProfile);
router.patch('/profile', protect, ctrl.updateProfile);
router.post('/profile/photo', protect, upload.single('photo'), ctrl.uploadProfilePhoto);

module.exports = router;
