const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/testController');

router.get('/', protect, ctrl.getTests);
router.get('/question-bank', protect, authorize('sir'), ctrl.getQuestionBank);
router.delete('/questions/:id', protect, authorize('sir'), ctrl.deleteQuestion);
router.get('/:id', protect, ctrl.getTest);
router.post('/', protect, authorize('sir'), ctrl.createTest);
router.put('/:id', protect, authorize('sir'), ctrl.updateTest);
router.post('/:id/questions', protect, authorize('sir'), ctrl.addQuestion);
router.delete('/:id/questions/:qid', protect, authorize('sir'), ctrl.removeQuestion);
router.post('/:id/attempt', protect, authorize('student'), ctrl.submitAttempt);
router.get('/:id/results', protect, ctrl.getResults);
router.patch('/:id/release', protect, authorize('sir'), ctrl.releaseResults);
router.patch('/:id/grade', protect, authorize('sir'), ctrl.gradeAttempt);

module.exports = router;
