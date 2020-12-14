var express = require('express');
var router = express.Router();

const dbmsController = require('../controllers/dbms.controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/dbms', dbmsController.dbms);

module.exports = router;
