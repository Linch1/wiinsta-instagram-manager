window.addEventListener('load', start);


(function($){
	$.fn.circle_menu = function(settings, options){
		var settings = $.extend(settings, options);
		var flag_click = false;		
		var angle = (settings.angle_initial*Math.PI)/180;
		var angle_increment = (settings.angle_increment*Math.PI)/180;
		var icon_circle = $(this).children("li");
		$(this).on("click",function(evt){
			// $("#teste li").addClass('ativo');
			let target = $(evt.target);
			if(!target.is("input")) return;	
			if(!flag_click){
				angle_aux = angle;				
				radius = settings.radius
				flag_click = true;				
			} else {
				radius = 0;
				flag_click = false;
			}			
			icon_circle.each(function(i){
				let left = radius*Math.cos(angle_aux);
				let bottom =radius*Math.sin(angle_aux);		
				setTimeout( () => {
					$(this).animate({'left':left,'bottom':bottom},{duration:250});
				}, i * 100)
				angle_aux+=angle_increment;			
			})
		})
	}
}(jQuery));


function start(){
	$(".circle-menu").click( evt => {
		let target = $(evt.target);
		if(!target.is("input")) return;
		$(".circle-menu").toggleClass("open");
	});
}

