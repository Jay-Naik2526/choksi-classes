const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const ctrl    = require('../controllers/pushController');

router.get('/vapid-key',    ctrl.getPublicKey);          // public
router.post('/subscribe',   protect, ctrl.subscribe);
router.delete('/unsubscribe', protect, ctrl.unsubscribe);

module.exports = router;
