"use strict";

console.log('Individual Treasure');

var crIndexIntoTreasureTable = [
	0, /* 0 */
	0, /* 1/8 */
	0, /* 1/4 */
	0, /* 1/2 */
	0, /* 1 */
	0, /* 2 */
	0, /* 3 */
	0, /* 4 */
	1, /* 5 */
	1, /* 6 */
	1, /* 7 */
	1, /* 8 */
	1, /* 9 */
	1, /* 10 */
	2, /* 11 */
	2, /* 12 */
	2, /* 13 */
	2, /* 14 */
	2, /* 15 */
	2  /* 16 */
];

var individualTreasureTable = [
	[
		{rollLow:  1, rollHigh:  30, treasure: [{amount: {number: 5, sides: 6, multiplier: 1}, currency: 'cp'}]},
		{rollLow: 31, rollHigh:  60, treasure: [{amount: {number: 4, sides: 6, multiplier: 1}, currency: 'sp'}]},
		{rollLow: 61, rollHigh:  70, treasure: [{amount: {number: 3, sides: 6, multiplier: 1}, currency: 'ep'}]},
		{rollLow: 71, rollHigh:  95, treasure: [{amount: {number: 3, sides: 6, multiplier: 1}, currency: 'gp'}]},
		{rollLow: 96, rollHigh: 100, treasure: [{amount: {number: 1, sides: 6, multiplier: 1}, currency: 'pp'}]}
	],
	[
		{rollLow:  1, rollHigh:  30, treasure: [{amount: {number: 4, sides: 6, multiplier: 100}, currency: 'cp'}, {amount: {number: 1, sides: 6, multiplier: 10}, currency: 'ep'}]},
		{rollLow: 31, rollHigh:  60, treasure: [{amount: {number: 6, sides: 6, multiplier:  10}, currency: 'sp'}, {amount: {number: 2, sides: 6, multiplier: 10}, currency: 'gp'}]},
		{rollLow: 61, rollHigh:  70, treasure: [{amount: {number: 3, sides: 6, multiplier:  10}, currency: 'ep'}, {amount: {number: 2, sides: 6, multiplier: 10}, currency: 'gp'}]},
		{rollLow: 71, rollHigh:  95, treasure: [{amount: {number: 4, sides: 6, multiplier:  10}, currency: 'gp'}]},
		{rollLow: 96, rollHigh: 100, treasure: [{amount: {number: 2, sides: 6, multiplier:  10}, currency: 'gp'}, {amount: {number: 3, sides: 6, multiplier:  1}, currency: 'pp'}]}
	],
	[
		{rollLow:  1, rollHigh:  20, treasure: [{amount: {number: 4, sides: 6, multiplier: 100}, currency: 'sp'}, {amount: {number: 1, sides: 6, multiplier: 100}, currency: 'gp'}]},
		{rollLow: 21, rollHigh:  35, treasure: [{amount: {number: 1, sides: 6, multiplier: 100}, currency: 'ep'}, {amount: {number: 1, sides: 6, multiplier: 100}, currency: 'gp'}]},
		{rollLow: 36, rollHigh:  75, treasure: [{amount: {number: 2, sides: 6, multiplier: 100}, currency: 'gp'}, {amount: {number: 1, sides: 6, multiplier:  10}, currency: 'pp'}]},
		{rollLow: 76, rollHigh: 100, treasure: [{amount: {number: 2, sides: 6, multiplier: 100}, currency: 'gp'}, {amount: {number: 2, sides: 6, multiplier:  10}, currency: 'pp'}]}
	],
	[
		{rollLow:  1, rollHigh:  15, treasure: [{amount: {number: 2, sides: 6, multiplier: 1000}, currency: 'ep'}, {amount: {number: 8, sides: 6, multiplier: 100}, currency: 'gp'}]},
		{rollLow: 16, rollHigh:  55, treasure: [{amount: {number: 1, sides: 6, multiplier: 1000}, currency: 'gp'}, {amount: {number: 1, sides: 6, multiplier: 100}, currency: 'pp'}]},
		{rollLow: 56, rollHigh: 100, treasure: [{amount: {number: 1, sides: 6, multiplier: 1000}, currency: 'gp'}, {amount: {number: 2, sides: 6, multiplier: 100}, currency: 'pp'}]}
	]
	];

function getIndividualTreasureTable(crIndex)
{
	if (crIndex >= crIndexIntoTreasureTable.length)
	{
		return individualTreasureTable[3];
	}

	return individualTreasureTable[crIndexIntoTreasureTable[crIndex]];
}

function getIndivdualTreasureTableRow(treasureTable, roll)
{
	for (var i = 0; i < treasureTable.length; i++)
	{
		if (roll >= treasureTable[i].rollLow && roll <= treasureTable[i].rollHigh)
		{
			return treasureTable[i];
		}
	}

	return null;
}

function rollIndividualTreasureTableRow(treasureTable)
{
	var roll = Math.floor(Math.random() * 100) + 1;
	return getIndivdualTreasureTableRow(treasureTable, roll);
}

function rollIndividualTreasure(treasureTableRow, treasures)
{
	for (var j = 0; j < treasureTableRow.treasure.length; j++)
	{
		var sum = 0;

		for (var i = 0; i < treasureTableRow.treasure[j].amount.number; i++)
		{
			var rand = Math.random();
			var sides = treasureTableRow.treasure[j].amount.sides;
			sum += Math.floor(rand * sides) + 1;
		}

		if (treasures[treasureTableRow.treasure[j].currency])
		{
			treasures[treasureTableRow.treasure[j].currency] += sum;
		}
		else
		{
			treasures[treasureTableRow.treasure[j].currency] = sum;
		}
	}
}

function rollIndividualTreasures(number, crIndex, treasures)
{
	var treasureTable = getIndividualTreasureTable(crIndex);
	var row = rollIndividualTreasureTableRow(treasureTable);

	for (var i = 0; i < number; i++)
	{
		rollIndividualTreasure(row, treasures);
	}

	var properties = [
		'pp',
		'gp',
		'ep',
		'sp',
		'cp'];

	for (var i = 0; i < properties.length; i++) {
		if (treasures[properties[i]]) {
			console.log(properties[i] + ": " + treasures[properties[i]]);
		}
	}

	return treasures;
}

function rollIndividualTreasureBatch(cr0to4Count, cr5to10Count, cr11to16Count, cr17to20Count)
{
	var treasures = {};
	var rollCounts = [cr0to4Count, cr5to10Count, cr11to16Count, cr17to20Count];
	var i, j;
	var treasureTable;
	var row;

	for (i = 0; i < 4; i++)
	{
		treasureTable = individualTreasureTable[i];
		row = rollIndividualTreasureTableRow(treasureTable);

		for (j = 0; j < rollCounts[i]; j++)
		{
			rollIndividualTreasure(row, treasures);
		}
	}

	return treasures;
}


