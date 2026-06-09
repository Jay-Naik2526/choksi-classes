const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/enquiryController');

router.post('/', ctrl.submitEnquiry);   // public — no auth

module.exports = router;
