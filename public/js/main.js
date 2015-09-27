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