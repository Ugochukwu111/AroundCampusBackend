const express = require('express');
const router = express.Router();
const { sendContactMessage } = require('../controllers/contact');

router.post('/send-email', sendContactMessage);

module.exports = router;