window.addEventListener('load', start);

function start(){

	$('body').click( evt => {
		let target = $(evt.target);
		let profile;
		let parent = target.closest(".dashboard .card");

		if(parent)profile = parent.attr("data-profile")
		else profile = null;
		
		if(profile){
			if(target.is(".dashboard .card .icon.run")){
				run_bot(profile);
			} else if ( target.is(".dashboard .card .icon.stop")){
				stop_bot(profile);
			} else if ( target.is(".dashboard .card .icon.logs")){
				console.log("opening logs");
			}
		}


	});
}