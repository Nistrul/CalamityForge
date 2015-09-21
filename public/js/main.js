
$(function() {
	var $xpinput = $('#xpinput');

	$xpinput.keypress(
		function() 
		{
			if (e.which == 13) 
			{
				$.get('/encounters/xp/'+$xpinput.value, {}, function(result) {
					$('#target').html(result);
				});
			}
		});
});