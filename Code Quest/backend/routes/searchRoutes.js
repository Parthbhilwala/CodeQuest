const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.get('/search', searchController.search);
router.post('/send-email', searchController.sendEmail);

module.exports = router;

