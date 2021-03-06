$(function() {
	var $xpinput = $('#xpinput');

	$xpinput.keypress(
		function(e) 
		{
			if (e.which == 13) 
			{
				var $target = $('#target');

				var parsedValue = parseInt($xpinput.val(), 10);

				if (!isNaN(parsedValue) && parsedValue >= xpmin && parsedValue <= xpmax)
				{
					$.get('/encounterTable/xp/' + $xpinput.val(), {}, function(result) {
						$target.html(result);
						window.history.pushState(
							{
								"targetHtml":$target.html()
							}, 
							'', 
							'/encounters/xp/' + $xpinput.val());
					});

					$('#xpalert').hide();
				}
				else
				{
					$('#xpalert').show();
					$('#xpinput').val('');
				}
			}
		});
});

window.onpopstate = function(e){
    if(e.state){
        $('#target').html(e.state.targetHtml);
        $('#xpinput').val('');
    }
    else
    {
        $('#target').children(":first").empty();
        $('#xpinput').val('');    
    }
};


function rollOnTable(rollElementId)
{
	var roll = Math.floor(Math.random() * 100) + 1;
	$(rollElementId).val(roll);

	var $encounterTableInner = $('.encounterTableInner');
	var $encounterTable = $encounterTableInner.find('#encounterTable');
	var $encounterTableBody = $encounterTable.children('tbody');
	var $selectedElement;

    console.log("rolling on table");

    $encounterTableBody.children('tr.encounterTableBodyRow').each(function() {
    	$this = $(this);
    	var low = parseInt($(this).attr("data-low"));
    	var high = parseInt($(this).attr("data-high"));

    	if (roll >= low && roll <= high)
    	{
    		$this.addClass("success");
    		$selectedElement = $this;
    	}
    	else
    	{
    		$this.removeClass("success");
    	}
    });

    var containerTop = $encounterTableBody.offset().top;
    var containerBottom = containerTop + $encounterTableBody.innerHeight();
    var selectedTop = $selectedElement.offset().top;;
    var selectedBottom  = selectedTop + $selectedElement.innerHeight();
    var scroll = selectedTop - containerTop + $encounterTableBody.scrollTop();

    if (selectedTop < containerTop || selectedBottom > containerBottom)
    {
		$encounterTableBody.animate({
    		scrollTop: scroll
		});
	}

	var treasures = [];
	var crgroups = parseInt($selectedElement.attr("data-crgroups"));

	for (var i = 0; i < crgroups; i++)
	{
		var groupCount = parseInt($selectedElement.attr("data-crgroup" + i + "count"));
		var groupCRIndex = parseInt($selectedElement.attr("data-crgroup" + i + "index"));
		rollIndividualTreasures(groupCount, groupCRIndex, treasures);
	}
}
