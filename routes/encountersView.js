/* jshint node: true */
"use strict";

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) 
{
	res.render('encounters', { title: 'Encounters' });
});

module.exports = router;
