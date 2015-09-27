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

function rollOnTable()
{

	var roll = Math.floor(Math.random() * 100) + 1;
	$('#rollDisplay').val(roll);

	var encounterTable = $('#encounterTable');

    console.log("rolling on table");

    encounterTable.children('tbody').children('tr.encounterTableRow').each(function() {
    	$this = $(this);
    	var low = parseInt($(this).attr("data-low"));
    	var high = parseInt($(this).attr("data-high"));

    	if (roll >= low && roll <= high)
    	{
    		$this.addClass("success");
    	}
    	else
    	{
    		$this.removeClass("success");
    	}
    });
}