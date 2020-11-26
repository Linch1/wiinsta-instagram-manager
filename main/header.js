window.addEventListener('load', start);



async function start(){

	populate_profiles();
	ProfilesDatas['settingsScheme'] = JSON.parse($('#datas').text());
	let count = 0;
	for (let i in ProfilesDatas['settingsScheme']) {
	   if (ProfilesDatas['settingsScheme'].hasOwnProperty(i)) count++;
	}
	ProfilesDatas['settingsScheme'].length = count;
	// when is requested to delete a profile this is set to true;
	let DELETING = false;

	/*
	@info: when the select that contains the profiles changes value the "currentProfile" is updated
	*/
	$('.selectem-value').change( evt => {
		let currentProfile = ProfilesDatas["currentProfile"] = $(evt.currentTarget).val().trim();
		if(currentProfile == '' || currentProfile == 'default'|| !currentProfile) return;
		populate_inputs(getCurrentSettings());
		
		changeProfilesIcon(`${getAvatarPath(getCurrentSettings()["profile_avatar"])}`);
		
		$('.left-medias').val(left_images_counter(currentProfile, getCurrentSettings()['hashtags']));

	});

	/*
	@info: stops the bot of the currentProfile
	*/
	$('.stop').click( evt => {
		stop_bot();
		show_popup(getCurrentUser(), 'success', getCurrentUserAvatarPath(), "Bot stopped");
	});

	/*
	@info: stops the bots of all the profiles
	*/
	$('.stop-all').click( evt => {
		let profiles = getAllProfiles();
		for (let i = 0; i < profiles.length; i++) {
			stop_bot(profiles[i]);
		}
		show_popup('wiinsta', 'success', LOGO_PATH, "Bots stopped");
	});

	/*
	@info: clear the session of the selected profile
	*/
	$('.clear-session').click( evt => {
		if(!is_valid_profile()) return;
		new instabot(getCurrentUser()).clear_partition();
		show_popup(getCurrentUser(), 'success', getCurrentUserAvatarPath(), "The session was cleared");
	});

	$("body").click( evt => {
		
		let target = $(evt.target); // elemento cliccato

		
		if(target.closest('.alert .button.close').length){
			/* @info: close the confirmation alert */
			DELETING = false;
			close_popup(target.closest('.alert'));
		} else if(target.closest('.alert .button.confirm').length){
			/* @info: delete the currentProfile */
			if(DELETING);
			DELETING = false;
			if(!is_valid_profile()) return;
			new instabot(getCurrentUser()).delete();
			reset();
			close_popup(target.closest('.alert'));
		}
	});
	/*
	@info: popup the delete confirmation messaage
	*/
	$('.delete').click( evt => {
		if(!is_valid_profile()) return;
		DELETING = true;
		show_popup_choice(getCurrentUser(), 'warning', getCurrentUserAvatarPath(), "Are you sure to delete this profile?");
	});
	

	/*
	@info: update the current profile datas
	*/
	$('.send-edits').click( evt => {
		console.log("sending edits")
		if(!is_valid_profile()) return;
		send_inputs();
		console.log("sent")
		let currentProfile = getCurrentUser();
		let avatarPath = getCurrentUserAvatarPath();
		let bot = getCurrentBot();
		show_popup(currentProfile, 'success', avatarPath, "new settings saved");
		if( bot ) bot.reloadSettings();
		reset();
		
	});

	/*
	clear the settings fields
	*/
	$('.clear-fields').click( evt => {
		reset();
	});
}
