/* jshint node: true */
"use strict";

var express = require('express');
var router = express.Router();
var encounterTable = require('../src/encounterTable');

/* GET home page. */
router.get('/', function(req, res, next) 
{
	res.render('encounters', { title: 'Encounters', xpmin: 10, xpmax: 155000 });
});

router.get('/xp/:xpvalue', function(req, res, next)
{
	var xp = parseInt(req.params.xpvalue);

	var table = encounterTable.create(xp, 100);
	var selected = encounterTable.select(table);

	console.log('selected: ' + JSON.stringify(selected, null, 4));

	res.render('encounters', { title: 'Encounters', encounters: table, chosen: selected, xpmin: 10, xpmax: 155000});
});

module.exports = router;
