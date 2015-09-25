$(function() {
	var $xpinput = $('#xpinput');

	$xpinput.keypress(
		function(e) 
		{
			if (e.which == 13) 
			{
				$.get('/encounterTable/xp/' + $xpinput.val(), {}, function(result) {
					$('#target').html(result);
				});
			}
		});
});
