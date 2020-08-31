window.addEventListener('load', start);

function start(){
	
	$('#run').click( evt => {
		if ( !is_valid_profile() ) return;

		if(!fs.existsSync(getCurrentObject()["profile_fl"])){
			show_popup('wiinsta', 'profile not found', LOGO_PATH, "Selected user doesn't exists");
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
			show_popup('wiinsta', 'invalid profile', LOGO_PATH, "Select a valid profile");
			return;
		}
		if(getCurrentBot()){
			show_popup('wiinsta', 'busy profile', LOGO_PATH, "Selected profile is already logged or it's currently logging");
			return;
		}
		let bot = new instabot(profile);
		setCurrentBot(bot);
		await bot.ig_api_login();
		show_popup('wiinsta', 'login', LOGO_PATH, "Succes login");
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