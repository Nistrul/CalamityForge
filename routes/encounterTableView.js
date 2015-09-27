/* jshint node: true */
"use strict";

var express = require('express');
var router = express.Router();
var encounterTable = require('../src/encounterTable');

router.get('/xp/:xpvalue', function(req, res, next)
{
	var xp = parseInt(req.params.xpvalue);

	if (isNaN(xp))
	{
		res.status(400);
		res.render('errorInner', { error: { message: 'xp must be an integer', status: 400 }});
	}
	else if (xp < encounterTable.constants.xpmin || xp > encounterTable.constants.xpmax)
	{
		res.status(400);
		res.render('errorInner', { 
			error: { 
				message: 'xp must be >= ' + encounterTable.constants.xpmin + ' and <= ' + encounterTable.constants.xpmax, 
				status: 400
			}
		});
	}
	else
	{
		var table = encounterTable.create(xp, 100);

		res.render('encounterTable', { title: 'Encounters', encounters: table});
	}
});

module.exports = router;