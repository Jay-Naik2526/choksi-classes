const express   = require('express');
const router    = express.Router();
const ctrl      = require('../controllers/enquiryController');
const { protect, authorize } = require('../middleware/auth');

router.post('/',     ctrl.submitEnquiry);                                    // public
router.get('/',      protect, authorize('sir'), ctrl.listEnquiries);         // sir only
router.patch('/:id', protect, authorize('sir'), ctrl.updateEnquiry);         // sir only
router.delete('/:id',protect, authorize('sir'), ctrl.deleteEnquiry);         // sir only

module.exports = router;
