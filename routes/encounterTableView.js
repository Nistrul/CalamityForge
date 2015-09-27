/* jshint node: true */
"use strict";

var express = require('express');
var router = express.Router();
var encounterTable = require('../src/encounterTable');

router.get('/xp/:xpvalue', function(req, res, next)
{
	var xp = parseInt(req.params.xpvalue);

	var table = encounterTable.create(xp, 100);
	var selected = encounterTable.select(table);


	res.render('encounterTable', { title: 'Encounters', encounters: table, chosen: selected});
});

module.exports = router;