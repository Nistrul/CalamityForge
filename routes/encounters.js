"use strict";

var express = require('express');
var router = express.Router();
var bs = require('binarysearch');

var g_encountersCRTable = [
	{crIndex:  0, cr:   '0', xp:     10},
	{crIndex:  1, cr: '1/8', xp:     25},
	{crIndex:  2, cr: '1/4', xp:     50},
	{crIndex:  3, cr: '1/2', xp:    100},
	{crIndex:  4, cr:   '1', xp:    200}, 
	{crIndex:  5, cr:   '2', xp:    450},
	{crIndex:  6, cr:   '3', xp:    700},
	{crIndex:  7, cr:   '4', xp:   1100},
	{crIndex:  8, cr:   '5', xp:   1800},
	{crIndex:  9, cr:   '6', xp:   2300},
	{crIndex: 10, cr:   '7', xp:   2900},
	{crIndex: 11, cr:   '8', xp:   3900},
	{crIndex: 12, cr:   '9', xp:   5000},
	{crIndex: 13, cr:  '10', xp:   5900},
	{crIndex: 14, cr:  '11', xp:   7200},
	{crIndex: 15, cr:  '12', xp:   8400},
	{crIndex: 16, cr:  '13', xp:  10000},
	{crIndex: 17, cr:  '14', xp:  11500},
	{crIndex: 18, cr:  '15', xp:  13000},
	{crIndex: 19, cr:  '16', xp:  15000},
	{crIndex: 20, cr:  '17', xp:  18000},
	{crIndex: 21, cr:  '18', xp:  20000},
	{crIndex: 22, cr:  '19', xp:  22000},
	{crIndex: 23, cr:  '20', xp:  25000},
	{crIndex: 24, cr:  '21', xp:  33000},
	{crIndex: 25, cr:  '22', xp:  41000},
	{crIndex: 26, cr:  '23', xp:  50000},
	{crIndex: 27, cr:  '24', xp:  62000},
	{crIndex: 33, cr:  '30', xp: 155000}
	];

var g_weightMultiplierByCreatureCount = [
	0, // 0
	4, // 1
	3, // 2
	2, // 3
	1.75, // 4
	1.5, // 5
	1.25, // 6
	1, // 7
	0.875, // 8
	0.75, // 9
	0.625, // 10
	0.5,   // 11
	0.4375, // 12
	0.375, // 13
	0.3125, // 14
	0.25, // 15
	0.21875, // 16
	0.1875, // 17
	0.15625, // 18 
];

var g_encounterSettings = {
	maxCreatures: 18,
	minGroupSignificance: 0.2,
	maxLevelDifference: 4,
	maxExperience: 155000
};

var g_masterEncounterTable = generateEncounterTable(g_encountersCRTable, g_encounterSettings);

var g_testEncounterTable1 = [
	{
		creatureGroups:
		[
		{
			crIndex: 4,
			cr: '1',
			num: 4
		},
		{
			crIndex: 3,
			cr: '1/2',
			num: 2
		},
		{
			crIndex: 2,
			cr: '1/4',
			num: 2
		}],
		xp: 1000,
		text: 'test: 4x 1, 2x 1/2, 2x 1/4'
	},
	{
		creatureGroups:
		[{
			crIndex: 4,
			cr: '1',
			num: 4
		},
		{
			crIndex: 3,
			cr: '1/2',
			num: 3
		},
		{
			crIndex: 2,
			cr: '1/4',
			num: 1
		}],
		xp: 1000,
		text: 'test: 4x 1, 3x 1/2, 1x 1/4'
	},
	{
		creatureGroups:
		[{
			crIndex: 4,
			cr: '1',
			num: 2
		},
		{
			crIndex: 3,
			cr: '1/2',
			num: 6
		},
		{
			crIndex: 2,
			cr: '1/4',
			num: 1
		}],
		xp: 1000,
		text: 'test: 2x 1, 6x 1/2, 1x 1/4'
	},
	{
		creatureGroups:
		[{
			crIndex: 4,
			cr: '2',
			num: 4
		},
		{
			crIndex: 3,
			cr: '1/2',
			num: 3
		},
		{
			crIndex: 2,
			cr: '1/4',
			num: 1
		}],
		xp: 1000,
		text: 'test: 4x 2, 3x 1/2, 1x 1/4'
	}
];

function getXPMultiplerByCreatureCount(creatureCount)
{
	var creatureCountXPMultiplierTable = [1, 1.5, 2, 2, 2, 2, 2.5, 2.5, 2.5, 2.5, 3, 3, 3, 3];

	if (creatureCount <= 0)	// 0
	{
		return 0;
	}
	else if (creatureCount <= 14)	// 1-14
	{
		return creatureCountXPMultiplierTable[creatureCount - 1];
	}
	else
	{
		return 4;	// 15+
	}
}

function generateSingleCREncounters(crEntry, encounterSettings, result)
{
	var numCreatures;
	var totalXP;

	for (numCreatures = 1; numCreatures <= encounterSettings.maxCreatures; numCreatures++)
	{
		totalXP = crEntry.xp * numCreatures * getXPMultiplerByCreatureCount(numCreatures);

		if (totalXP <= encounterSettings.maxExperience)
		{
			result.push(
				{
					creatureGroups: 
					[
						{
							crIndex: crEntry.crIndex,
							cr: crEntry.cr, 
							num: numCreatures
						}
					],
					xp: totalXP,
					text: numCreatures + 'x ' + crEntry.cr + ' (' + totalXP + ')', 
				});
		}
	}
}

function generateDoubleCREncounters(crEntry1, crEntry0, encounterSettings, result)
{
	var numCreature0;
	var numCreature1;
	var xpMultiplier;
	var totalXP;
	var group0XP;
	var group1XP;
	var significance0;
	var significance1;

	for (numCreature0 = 1; numCreature0 < encounterSettings.maxCreatures; numCreature0++)
	{
		for (numCreature1 = 1; numCreature1 + numCreature0 <= encounterSettings.maxCreatures; numCreature1++)
		{
			xpMultiplier = getXPMultiplerByCreatureCount(numCreature1 + numCreature0);
			group1XP = crEntry1.xp * numCreature1 * xpMultiplier;
			group0XP = crEntry0.xp * numCreature0 * xpMultiplier;

			if (group1XP >= group0XP)
			{
				significance1 = 1;
				significance0 = group0XP / group1XP;
			}
			else
			{
				significance1 = group1XP / group0XP;
				significance0 = 1;
			}

			if (significance1 >= encounterSettings.minGroupSignificance && significance0 >= encounterSettings.minGroupSignificance)
			{
				totalXP = group1XP + group0XP;

				if (totalXP <= encounterSettings.maxExperience)
				{
					result.push(
					{
						creatureGroups:
						[
							{
								crIndex: crEntry1.crIndex,
								cr: crEntry1.cr, 
								num: numCreature1
							}, 
							{
								crIndex: crEntry0.crIndex,
								cr: crEntry0.cr, 
								num: numCreature0
							}
						],
						xp: totalXP,
						text: numCreature1 + 'x ' + crEntry1.cr + ', ' + numCreature0 + 'x ' + crEntry0.cr + ' (' + totalXP + ')' 
					});
				}
			}
		}
	}
}

function generateTripleCREncounters(crEntry2, crEntry1, crEntry0, encounterSettings, result)
{
	var numCreature0;
	var numCreature1;
	var numCreature2;
	var xpMultiplier;
	var group0XP;
	var group1XP;
	var group2XP;
	var totalXP;
	var divisor;
	var significance0;
	var significance1;
	var significance2;

	for (numCreature0 = 1; numCreature0 <= (encounterSettings.maxCreatures - 2); numCreature0++)
	{
		for (numCreature1 = 1; numCreature1 + numCreature0 <= (encounterSettings.maxCreatures - 1); numCreature1++)
		{
			for (numCreature2 = 1; numCreature2 + numCreature1 + numCreature0 <= encounterSettings.maxCreatures; numCreature2++)
			{
				xpMultiplier = getXPMultiplerByCreatureCount(numCreature2 + numCreature1 + numCreature0);
				group2XP = crEntry2.xp * numCreature2 * xpMultiplier;
				group1XP = crEntry1.xp * numCreature1 * xpMultiplier;
				group0XP = crEntry0.xp * numCreature0 * xpMultiplier;

				if (group2XP >= group1XP && group2XP >= group0XP)
				{
					divisor = group2XP;
				}
				else if (group1XP >= group2XP && group1XP >= group0XP)
				{
					divisor = group1XP;
				}
				else
				{
					divisor = group0XP;
				}

				significance2 = group2XP / divisor;
				significance1 = group1XP / divisor;
				significance0 = group0XP / divisor;

				if (significance2 > encounterSettings.minGroupSignificance && significance1 > encounterSettings.minGroupSignificance && significance0 > encounterSettings.minGroupSignificance)
				{
					totalXP = group0XP + group1XP + group2XP;
						

					if (totalXP <= encounterSettings.maxExperience && 
						numCreature0 >= numCreature1 && numCreature1 >= numCreature2 &&
						crEntry0.crIndex != 0 || totalXP < 700)
					{
						result.push(
						{
							creatureGroups:
							[
								{
									crIndex: crEntry2.crIndex,
									cr: crEntry2.cr,
									num: numCreature2
								},
								{
									crIndex: crEntry1.crIndex,
									cr: crEntry1.cr, 
									num: numCreature1
								}, 
								{
									crIndex: crEntry0.crIndex,
									cr: crEntry0.cr, 
									num: numCreature0
								}
							],
							xp: totalXP,
							text: numCreature2 + 'x ' + crEntry2.cr + ', ' + numCreature1 + 'x ' + crEntry1.cr + ', ' + numCreature0 + 'x ' + crEntry0.cr + ' (' + totalXP + ')' 
						});
					}
				}
			}
		}
	}
}

function compareEncounterByWeightCRNum(a, b)
{
	var i;
	var maxGroupLength = Math.max(a.creatureGroups.length, b.creatureGroups.length);

	if (a.weight === b.weight)
	{
		for (i = 0; i < maxGroupLength; i++)
		{
			if (i >= b.creatureGroups.length)
			{
				return -1;
			}
			else if (i >= a.creatureGroups.length)
			{
				return +1;
			}

			if (a.creatureGroups[i].crIndex === b.creatureGroups[i].crIndex)
			{
				if (a.creatureGroups[i].num != b.creatureGroups[i].num)
				{
					return b.creatureGroups[i].num - a.creatureGroups[i].num;
				}
			}
			else
			{
				return b.creatureGroups[i].crIndex - a.creatureGroups[i].crIndex;
			}
		}
	}

	return b.weight - a.weight;
}
function compareEncounterByXPCR(a, b)
{
	var i;
	var maxGroupLength = Math.max(a.creatureGroups.length, b.creatureGroups.length);

	if (a.xp === b.xp)
	{
		for (i = 0; i < maxGroupLength; i++)
		{
			if (i >= b.creatureGroups.length)
			{
				return -1;
			}
			else if (i >= a.creatureGroups.length)
			{
				return +1;
			}

			if (a.creatureGroups[i].crIndex === b.creatureGroups[i].crIndex)
			{
				if (a.creatureGroups[i].num != b.creatureGroups[i].num)
				{
					return b.creatureGroups[i].num - a.creatureGroups[i].num;
				}
			}
			else
			{
				return b.creatureGroups[i].crIndex - a.creatureGroups[i].crIndex;
			}
		}
	}

	return a.xp-b.xp
}

function compareEncounterByXPGroupCountCR(a, b)
{
	var i;

	if (a.xp === b.xp)
	{
		if (a.creatureGroups.length != b.creatureGroups.length)
		{
			return b.creatureGroups.length - a.creatureGroups.length;
		}

		for (i = 0; i < a.creatureGroups.length; i++)
		{
			if (a.creatureGroups[i].crIndex === b.creatureGroups[i].crIndex)
			{
				if (a.creatureGroups[i].num != b.creatureGroups[i].num)
				{
					return b.creatureGroups[i].num - a.creatureGroups[i].num;
				}
			}
			else
			{
				return b.creatureGroups[i].crIndex - a.creatureGroups[i].crIndex;
			}
		}
	}

	return a.xp-b.xp
}

function compareEncounterByGroupCountCRNum(a, b)
{
	var i;

	if (a.creatureGroups.length != b.creatureGroups.length)
	{
		return b.creatureGroups.length - a.creatureGroups.length;
	}

	for (i = 0; i < a.creatureGroups.length; i++)
	{
		if (a.creatureGroups[i].crIndex === b.creatureGroups[i].crIndex)
		{
			if (a.creatureGroups[i].num != b.creatureGroups[i].num)
			{
				return b.creatureGroups[i].num - a.creatureGroups[i].num;
			}
		}
		else
		{
			return b.creatureGroups[i].crIndex - a.creatureGroups[i].crIndex;
		}
	}

	return 0;
}

function generateEncounterTable(crTable, encounterSettings)
{
	var encounterTable = [];
	var i, j, k;

	for (i = 0; i < crTable.length; i++)
	{
		generateSingleCREncounters(crTable[i], encounterSettings, encounterTable);
	}

	for (i = 0; i < crTable.length - 1; i++)
	{
		for (j = i + 1; (j < crTable.length) && ((j - i) <= encounterSettings.maxLevelDifference); j++)
		{
			generateDoubleCREncounters(crTable[j], crTable[i], encounterSettings, encounterTable);
		}
	}

	for (i = 0; i < crTable.length - 2; i++)
	{
		for (j = i + 1; (j < crTable.length - 1) && ((j - i) <= encounterSettings.maxLevelDifference); j++)
		{

			for (k = j + 1; k < crTable.length && k - i <= encounterSettings.maxLevelDifference; k++)
			{
				generateTripleCREncounters(crTable[k], crTable[j], crTable[i], encounterSettings, 
					encounterTable);
			}
		}
	}

	encounterTable.sort(compareEncounterByXPCR);

	return encounterTable;
}

function getXPTolerance(xp)
{
	var toleranceTable = [
		{xp:     10, tolerance: 1.500},
		{xp:     25, tolerance: 1.000},
		{xp:     30, tolerance: 0.800},
		{xp:     50, tolerance: 0.700},
		{xp:     60, tolerance: 0.600},
		{xp:     70, tolerance: 0.500},
		{xp:     80, tolerance: 0.400},
		{xp:     90, tolerance: 0.300},
		{xp:    100, tolerance: 0.200},
		{xp:    140, tolerance: 0.150},
		{xp:    200, tolerance: 0.100},
		{xp:    300, tolerance: 0.080},
		{xp:    500, tolerance: 0.050},
		{xp:    650, tolerance: 0.040},
		{xp:   1100, tolerance: 0.030},
		{xp:   2000, tolerance: 0.020},
		{xp:   7000, tolerance: 0.015},
		{xp:  10000, tolerance: 0.010},
		{xp:  20000, tolerance: 0.008},
		{xp:  50000, tolerance: 0.006},
		{xp: 100000, tolerance: 0.004}
	]

	var tolerance = toleranceTable[bs.closest(toleranceTable, xp,
			function(value, find)
			{
				if (value.xp > find)
				{
					return 1;
				}
				else if (value.xp < find)
				{
					return -1;
				}

				return 0;
			})].tolerance;

	var lowerBound = xp - xp * tolerance;
	var upperBound = xp + xp * tolerance;

	return { tolerance: tolerance, lower: lowerBound, upper: upperBound };
}

function createFilteredEncounterTable(parentEncounterTable, xp)
{
	var tolerance = getXPTolerance(xp);

	return bs.rangeValue(parentEncounterTable, tolerance.lower, tolerance.upper, 
		function(value, find) 
		{
	  		if (value.xp > find)
	  		{
	  			return 1;
	  		}
	  		else if (value.xp < find)
	  		{
	  			return -1;
	  		}

	  		return 0;
		});
}

function isEncounterSimilar(entry0, entry1)
{
	if (entry0.creatureGroups.length < 2)
	{
		return false;
	}

	if (entry0.creatureGroups.length != entry1.creatureGroups.length)
	{
		return false;
	}

	if (entry0.creatureGroups.length == 2)
	{
		return entry0.creatureGroups[0].cr === entry1.creatureGroups[0].cr && entry0.creatureGroups[1].cr == entry1.creatureGroups[1].cr;
	}
	else
	{
		return entry0.creatureGroups[0].cr === entry1.creatureGroups[0].cr && entry0.creatureGroups[0].num == entry1.creatureGroups[0].num && entry0.creatureGroups[1].cr === entry1.creatureGroups[1].cr;
	}
}

function createEncounterTableRemoveSimilarEntries(encounterTable)
{
	var i, j;
	var runStart = 0;
	var inRun = false;
	var selection;
	var newTable = [];
	var runLength;
	var random;
	var newTable = encounterTable.slice();
	var resultTable = [];

	newTable.sort(compareEncounterByXPGroupCountCR);

	for (i = 0; i < newTable.length; i++)
	{
		console.log(i + ': ' + newTable[i].text);

		if (i >= newTable.length - 1 || !isEncounterSimilar(newTable[i], newTable[i+1]))
		{
			runLength = i - runStart;

			if (runLength === 0)
			{
				selection = runStart;
				console.log('xxx');
			}
			else
			{
				random = Math.random();

				selection = runStart + Math.floor(random * (runLength + 1));

				// console.log('selecting ' + selection + ' from range ' + runStart + ' to ' + runStart + runLength - 1);
				console.log('random: ' + random);
				console.log('runLength: ' + runLength);
				console.log('selection: ' + selection);
				console.log('start: ' + runStart);
				console.log('end: ' + (runStart + runLength));

			}

			resultTable.push(newTable[selection]);
			runStart = i + 1;
		}
	}

	resultTable.sort(compareEncounterByXPCR);

	return resultTable;
}

function getCreatureCount(encounterTableEntry)
{
	var sum = 0;

	for (var i = 0; i < encounterTableEntry.creatureGroups.length; i++)
	{
		sum += encounterTableEntry.creatureGroups[i].num;
	}

	return sum;
}

function createValuedEncounterTable(encounterTable, xp)
{
	var valuedEncounterTable = [];
	var i;
	var xpDelta;
	var tolerance = getXPTolerance(xp);
	var weight;
	var entry;

	for (i = 0; i < encounterTable.length; i++)
	{
		// XP Difference from ideal
		xpDelta = Math.abs(xp - encounterTable[i].xp);
		weight = 1 - (xpDelta / (2 * (tolerance.upper - xp)));
		entry = encounterTable[i];
		entry.weight = weight;

		// number of creature groups
		if (encounterTable[i].creatureGroups.length == 1)
		{
			entry.weight *= 4;
		}

		// 0 level creatures generally don't make good enemies
		if (encounterTable[i].creatureGroups[0].crIndex === 0)
		{
			entry.weight *= 0.25;
		}

		entry.weight *= g_weightMultiplierByCreatureCount[getCreatureCount(encounterTable[i])];

		valuedEncounterTable.push(encounterTable[i]);
	}

	weightSimilarEntries(valuedEncounterTable);

	return valuedEncounterTable;
}

function weightSimilarEntries(encounterTable)
{
	var i, j;
	var runStart = 0;
	var runLength;
	var weightScale;

	encounterTable.sort(compareEncounterByGroupCountCRNum);

	for (i = 0; i < encounterTable.length; i++)
	{
		console.log(i + ': ' + encounterTable[i].text);

		if (i >= encounterTable.length - 1 || !isEncounterSimilar(encounterTable[i], encounterTable[i+1]))
		{
			runLength = i - runStart;

			if (runLength === 0)
			{
				console.log('xxx');
			}
			else
			{
				weightScale = 1 / (runLength + 1);

				for (j = 0; j < runLength + 1; j++)
				{
					encounterTable[(runStart + j)].weight *= weightScale;
					encounterTable[(runStart + j)].weightScale = weightScale;
				}

				// console.log('selecting ' + selection + ' from range ' + runStart + ' to ' + runStart + runLength - 1);
				console.log('weightScale: ' + weightScale);
				console.log('runLength: ' + runLength);
				console.log('start: ' + runStart);
				console.log('end: ' + (runStart + runLength));

			}

			runStart = i + 1;
		}
	}

	encounterTable.sort(compareEncounterByWeightCRNum);
}

function selectEncounter(encounterTable)
{
	var i;
	var weightSum = 0;
	var randomWeightSelection;

	for (i = 0; i < encounterTable.length; i++)
	{
		weightSum += encounterTable[i].weight;
	}

	encounterTable.weightSum = weightSum;
	randomWeightSelection = Math.random() * weightSum;

	weightSum = 0;
	i = 0;

	do
	{
		weightSum += encounterTable[i].weight;
		i++;
		console.log('i: ' + i + ', cumulativeWeight: ' + weightSum);
	} 
	while (weightSum <= randomWeightSelection);

	console.log('weightSum: ' + encounterTable.weightSum);
	console.log('randomWeightSelection: ' + randomWeightSelection);
	console.log('selectedIndex: ' + (i - 1));

	return encounterTable[i - 1];
}

/* GET home page. */
router.get('/', function(req, res, next) 
{
	res.render('encounters', { title: 'Encounters', encounters: g_masterEncounterTable });
});

router.get('/xp/:xpvalue', function(req, res, next)
{
	var xp = parseInt(req.params.xpvalue);

	var encounterTable;
	var selectedEncounter;

	encounterTable = createFilteredEncounterTable(g_masterEncounterTable, xp);
	// encounterTable = createEncounterTableRemoveSimilarEntries(encounterTable);
	encounterTable = createValuedEncounterTable(encounterTable, xp);
	selectedEncounter = selectEncounter(encounterTable);

	console.log('selected: ' + selectedEncounter.text);

	res.render('encounters', { title: 'Encounters', encounters: encounterTable, chosen: selectedEncounter});
});

module.exports = router;

