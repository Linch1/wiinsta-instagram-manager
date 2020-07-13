window.addEventListener('load', start);

function start(){
	
	$('#run').click( evt => {
		if ( !is_valid_profile() ) return;

		if(!fs.existsSync(getCurrentObject()["profile_fl"])){
			show_warning("SELECTED USER DOESN'T EXISTS ");
			return;
		}

		run_bot(getCurrentUser());
	});

	$('#run-all').click( evt => {
		let profiles = getAllProfiles();
		for (let i=0; i<profiles.length; i++){
			let profile = profiles[i];
			run_bot(profile);
		}
	});

	$("#api-login").click( async evt => {
		if (!is_valid_profile()) return;
		let profile = getCurrentUser();
		
		if(profile == "test"){
			show_warning("Select a valid profile");
			return;
		}
		if(getCurrentBot()){
			show_warning("selected profile is already logged or it's currently logging");
			return;
		}
		show_warning("Logging ...");
		let bot = new instabot(profile);
		setCurrentBot(bot);
		await bot.ig_api_login();
		show_warning("Succesfully logged");
	});

	$('#profile-name').keyup( evt => {
		let current_profile = ProfilesDatas["currentProfile"] = $(evt.currentTarget).val().trim();
		$('select.profiles').val('default');
		if(ProfilesDatas[current_profile]){
			select_profile(current_profile);
		}
	});


	$('body').change( e => {
		let target = $(e.target);
		if (target.hasClass('selector_input')){
			target.next().find('input').val(`${target[0].files[0].path}`);
		}
	});


}