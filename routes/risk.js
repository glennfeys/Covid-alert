var express = require('express');
var router = express.Router();

const riskController = require('../server/controllers/riskController');

/* GET home page. */
router.get('/:id', riskController.getRisk);

module.exports = router;