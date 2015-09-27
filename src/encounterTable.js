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
	0,
	4,
	3,
	2.5,
	2,
	1.75,
	1.5,
	1.25,
	1,
	0.875,
	0.75,
	0.625,
	0.5,
	0.4375,
	0.375,
	0.3125,
	0.25,
	0.21875,
	0.1875,
	0.15625 
];

var encounterSettings = {
	maxCreatures: 18,
	minGroupSignificance: 0.2,
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

	return bs.rangeValue(masterEncounterTable, tolerance.lower, tolerance.upper, 
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
				encounterTable[i].factors.similarCreatures = 1;
			}
			else
			{
				weightScale = 1 / (runLength + 1);

				for (j = 0; j < runLength + 1; j++)
				{
					encounterTable[(runStart + j)].weight *= weightScale;
					encounterTable[(runStart + j)].factors.similarCreatures = weightScale;
				}
			}

			runStart = i + 1;
		}
	}

	encounterTable.sort(compareEncounterByWeightCRNum);
}

function createNormalizedValuedEncounterTable(encounterTable, tableSize)
{
	var newEncounterTable = [];
	var weightSum = 0;

	for (var i = 0; i < encounterTable.length; i++)
	{
		weightSum += encounterTable[i].weight;
	}

	var factor = tableSize / weightSum;
	console.log('tableSize: ' + tableSize + ', weightSum: ' + weightSum + ', factor: ' + factor);

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
			console.log('weightSum + 1: ' + (weightSum + 1));
			weight -= (weightSum - tableSize);
			weightSum -= (weightSum - tableSize);
			console.log('weight: ' + weight);
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
		console.log('i: ' + i + ', cumulativeWeight: ' + weightSum);
	} 
	while (weightSum <= randomWeightSelection);

	console.log('weightSum: ' + encounterTable.weightSum);
	console.log('randomWeightSelection: ' + randomWeightSelection);
	console.log('selectedIndex: ' + (i - 1));

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
	select: select
}


