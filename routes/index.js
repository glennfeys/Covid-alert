var express = require('express');
var router = express.Router();

const KeyManager = require('./../pki/KeyManager');

let km = new KeyManager();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'IS-Project' });
});

router.get('/public-key/', function(req, res, next) {
  res.set("Content-Type", "text/plain");
  res.send(km.getCurrentPublicKeyPem());
});

module.exports = router;
