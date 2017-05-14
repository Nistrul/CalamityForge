/* jshint node: true */
"use strict";

var bs = require('binarysearch');


var encountersCRTable = [
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

var weightMultiplierByCreatureCount = [
	0.00,
	4.00,	//  1
	3.00,	//  2
	2.00,	//  3
	1.50,	//  4
	1.00,	//  5
	0.90,	//  6
	0.80,	//  7
	0.70,	//  8
	0.60,	//  9
	0.50,	// 10
	0.45,	// 11
	0.40,	// 12
	0.35,	// 13
	0.30,	// 14
	0.25,	// 15
	0.20,	// 16
	0.15,	// 17
	0.10,	// 18
	0.05 	// 19
];

var encounterSettings = {
	maxCreatures: 18,
	minGroupSignificance: 0.14,
	maxLevelDifferenceTriple: 4,
	maxLevelDifferenceDouble: 7,
	maxExperience: 155000
};

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
	{xp:    200, tolerance: 0.140},
	{xp:    300, tolerance: 0.130},
	{xp:    500, tolerance: 0.120},
	{xp:    650, tolerance: 0.120},
	{xp:   1100, tolerance: 0.120},
	{xp:   2000, tolerance: 0.120},
	{xp:   7000, tolerance: 0.120},
	{xp:  10000, tolerance: 0.120},
	{xp:  20000, tolerance: 0.120},
	{xp:  50000, tolerance: 0.120},
	{xp: 100000, tolerance: 0.120}
];

var masterEncounterTable = generateEncounterTable(encountersCRTable, encounterSettings);

var testEncounterTable1 = [
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
		totalXP = Math.ceil(crEntry.xp * numCreatures * getXPMultiplerByCreatureCount(numCreatures));

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
					text: numCreatures + 'x ' + crEntry.cr 
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
				totalXP = Math.ceil(group1XP + group0XP);

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
						text: numCreature1 + 'x ' + crEntry1.cr + ', ' + numCreature0 + 'x ' + crEntry0.cr 
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
					totalXP = Math.ceil(group0XP + group1XP + group2XP);
						

					if (totalXP <= encounterSettings.maxExperience && 
						numCreature0 >= numCreature1 && numCreature1 >= numCreature2 &&
						crEntry0.crIndex !== 0 || totalXP < 700)
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
							text: numCreature2 + 'x ' + crEntry2.cr + ', ' + numCreature1 + 'x ' + crEntry1.cr + ', ' + numCreature0 + 'x ' + crEntry0.cr
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

	return a.xp-b.xp;
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

function compareEncounterByGroupCountCRWeight(a, b)
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
			if (a.creatureGroups[i].weight != b.creatureGroups[i].weight)
			{
				return b.creatureGroups[i].weight - a.creatureGroups[i].weight;
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
		for (j = i + 1; (j < crTable.length) && ((j - i) <= encounterSettings.maxLevelDifferenceDouble); j++)
		{
			generateDoubleCREncounters(crTable[j], crTable[i], encounterSettings, encounterTable);
		}
	}

	for (i = 0; i < crTable.length - 2; i++)
	{
		for (j = i + 1; (j < crTable.length - 1) && ((j - i) <= encounterSettings.maxLevelDifferenceTriple); j++)
		{

			for (k = j + 1; k < crTable.length && k - i <= encounterSettings.maxLevelDifferenceTriple; k++)
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

function createFilteredEncounterTable(xp)
{
	var tolerance = getXPTolerance(xp);

	var newTable = bs.rangeValue(masterEncounterTable, tolerance.lower, tolerance.upper, 
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

	newTable.xp = xp;

	return newTable;
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
	valuedEncounterTable.xp = encounterTable.xp;
	var i;
	var xpDelta;
	var tolerance = getXPTolerance(xp);
	var entry;

	for (i = 0; i < encounterTable.length; i++)
	{
		entry = encounterTable[i];
		entry.factors = {};

		// XP Difference from ideal
		xpDelta = Math.abs(xp - encounterTable[i].xp);
		entry.factors.xpTolerance = 1 - (xpDelta / (1.5 * (tolerance.upper - xp)));

		entry.weight = entry.factors.xpTolerance;

		// number Of Groups
		if (encounterTable[i].creatureGroups.length == 1)
		{
			entry.factors.numberOfGroups = 1.5;
		}
		else
		{
			entry.factors.numberOfGroups = 1;
		}

		entry.weight *= entry.factors.numberOfGroups;

		// mostPowerfulCreature
		entry.factors.mostPowerfulCreature = (encounterTable[i].creatureGroups[0].crIndex / 4 + 0.1);
		entry.weight *= entry.factors.mostPowerfulCreature;

		// scale for number of creatures
		entry.factors.numberOfCreatures = weightMultiplierByCreatureCount[getCreatureCount(encounterTable[i])];
		entry.weight *= entry.factors.numberOfCreatures;

		valuedEncounterTable.push(encounterTable[i]);
	}

	return createEncounterTableRemoveSimilarEntries(valuedEncounterTable);
}

function createEncounterTableRemoveSimilarEntries(encounterTable)
{
	var i, j;
	var runStart = 0;
	var inRun = false;
	var selection;
	var runLength;
	var random;
	var newTable = encounterTable.slice();
	newTable.xp = encounterTable.xp;
	var resultTable = [];
	resultTable.xp = encounterTable.xp;

	newTable.sort(compareEncounterByGroupCountCRNum);

	for (i = 0; i < newTable.length; i++)
	{
		if (i >= newTable.length - 1 || !isEncounterSimilar(newTable[i], newTable[i+1]))
		{
			runLength = i - runStart;

			if (runLength === 0)
			{
				selection = runStart;
				resultTable.push(newTable[selection]);
			}
			else
			{
				var bestWeight = -1;
				var numBests = 0;

				for (j = runStart; j < runStart + runLength + 1; j++)
				{
					if (newTable[j].weight > bestWeight)
					{
						bestWeight = newTable[j].weight;
						numBests = 1;
					}
					else if (newTable[j].weight === bestWeight)
					{
						numBests += 1;
					}
				}

				for (j = runStart; j < runStart + runLength + 1; j++)
				{
					if (newTable[j].weight === bestWeight)
					{
						newTable[j].weight /= numBests;
						resultTable.push(newTable[j]);
					}
				}
			}

			runStart = i + 1;
		}
	}

	resultTable.sort(compareEncounterByWeightCRNum);

	return resultTable;
}


function createNormalizedValuedEncounterTable(encounterTable, tableSize)
{
	var newEncounterTable = [];
	newEncounterTable.xp = encounterTable.xp;
	var weightSum = 0;

	for (var i = 0; i < encounterTable.length; i++)
	{
		weightSum += encounterTable[i].weight;
	}

	var factor = tableSize / weightSum;

	// round
	var weightSumPrev = 0;
	weightSum = 0;
	var weight;

	for (i = 0; i < encounterTable.length && weightSum < tableSize; i++)
	{
		weight = Math.ceil((encounterTable[i].weight * factor));
		weightSum += weight;

		if ((weightSum + 1) > tableSize)
		{
			weight -= (weightSum - tableSize);
			weightSum -= (weightSum - tableSize);
		}

		newEncounterTable.push(encounterTable[i]);
		newEncounterTable[i].weight = weight;

		if (weight === 1)
		{
			newEncounterTable[i].rollText = weightSum;
		}
		else
		{
			newEncounterTable[i].rollText = (weightSumPrev + 1) + ' - ' + weightSum;
		}

		newEncounterTable[i].low = weightSumPrev + 1;
		newEncounterTable[i].high = weightSum;

		weightSumPrev = weightSum;
	}

	return newEncounterTable;
}

function select(encounterTable)
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
	} 
	while (weightSum <= randomWeightSelection);

	return { roll: (Math.floor(randomWeightSelection) + 1), entry: encounterTable[i - 1] };
}

function create(xp, diceSize)
{
	var table;
	
	table = createFilteredEncounterTable(xp);
	table = createValuedEncounterTable(table, xp);
	table = createNormalizedValuedEncounterTable(table, diceSize);

	return table;
}

module.exports = {
	create: create,
	select: select,
	constants: { 
		xpmin: encountersCRTable[0].xp,
		xpmax: encountersCRTable[encountersCRTable.length - 1].xp
	},
	debugging: false
};