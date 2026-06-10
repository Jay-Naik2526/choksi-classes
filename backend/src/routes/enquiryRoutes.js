const express    = require('express');
const router     = express.Router();
const rateLimit  = require('express-rate-limit');
const ctrl       = require('../controllers/enquiryController');
const { protect, authorize } = require('../middleware/auth');

// Rate-limit only the public submission endpoint, not Sir's authenticated reads
const enquiryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,   // 1 hour window
    max: 10,                     // max 10 submissions per IP per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many enquiries. Please call us directly.' },
});

router.post('/',     enquiryLimiter, ctrl.submitEnquiry);                    // public (rate-limited)
router.get('/',      protect, authorize('sir'), ctrl.listEnquiries);         // sir only (no rate limit)
router.patch('/:id', protect, authorize('sir'), ctrl.updateEnquiry);         // sir only
router.delete('/:id',protect, authorize('sir'), ctrl.deleteEnquiry);         // sir only

module.exports = router;
