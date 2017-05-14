$(function() {
	var individualTreasureForm = $( "#individualTreasureForm" );

	$( "#individualTreasureForm" ).submit(function( event ) {
	  var elem = $( this );

	  var cr0to4Count = elem.find("#cr0to4").val();
	  var cr5to10Count = elem.find("#cr5to10").val();
	  var cr11to16Count = elem.find("#cr11to16").val();
	  var cr17to20Count = elem.find("#cr17to20").val();

	  var treasures = rollIndividualTreasureBatch(cr0to4Count, cr5to10Count, cr11to16Count, cr17to20Count);

	  var resultString = "<ul>";
	  var currencies = ['pp', 'gp', 'ep', 'sp', 'cp'];

	  for (var i = 0; i < currencies.length; i++)
	  {
		  if (treasures[currencies[i]])
		  {
		    resultString = resultString + '<li>' + treasures[currencies[i]] + currencies[i];
		  }
	  }

	  resultString = resultString + '</ul>';

	  var resultNode = $("#individualTreasureResult");
	  resultNode.html(resultString);

	  event.preventDefault();
	});
});