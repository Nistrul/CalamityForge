$(function() {
	var $xpinput = $('#xpinput');

	$xpinput.keypress(
		function(e) 
		{
			if (e.which == 13) 
			{
				var $target = $('#target');
				$.get('/encounterTable/xp/' + $xpinput.val(), {}, function(result) {
					$target.html(result);
					window.history.pushState(
						{
							"targetHtml":$target.html()
						}, 
						'', 
						'/encounters/xp/' + $xpinput.val());
					console.log("pushed it");
				});
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
        $('#target').remove();
        $('#xpinput').val('');    
    }
};