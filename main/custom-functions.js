Array.prototype.removeAll = function removeItem(item) {
	let index = this.indexOf(item);
	while (index != -1) {
		this.splice(index, 1);
		index = this.indexOf(item);
	} 
	return this;
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
}

function arraysEqual(a1,a2) {
    return JSON.stringify(a1)==JSON.stringify(a2);
}

/*
@info: convert a date in ms to ISO format
@return: string in ISO format
*/
function ms_to_iso(date_ms) {
	let date = new Date(parseInt(date_ms));
	let year = date.getFullYear();
	let month = date.getMonth().toString().length === 1 ? '0' + (date.getMonth() + 1).toString() : date.getMonth() + 1;
	let day = date.getDate().toString().length === 1 ? '0' + (date.getDate()).toString() : date.getDate();
	let hours = date.getHours().toString().length === 1 ? '0' + date.getHours().toString() : date.getHours();
	let minutes = date.getMinutes().toString().length === 1 ? '0' + date.getMinutes().toString() : date.getMinutes();
	let date_str = `${year}-${month}-${day}T${hours}:${minutes}`;
	return date_str;
}

/*
@info: convert a date in ms to custom format
@return: string in custom format
*/
function ms_to_date_str(date_ms){
	let date = new Date(parseInt(date_ms));

	let month = date.getMonth().toString().length === 1 ? '0' + (date.getMonth() + 1).toString() : date.getMonth() + 1;
	let day = date.getDate().toString().length === 1 ? '0' + (date.getDate()).toString() : date.getDate();
	
	let hours = date.getHours().toString().length === 1 ? '0' + date.getHours().toString() : date.getHours();
	let minutes = date.getMinutes().toString().length === 1 ? '0' + date.getMinutes().toString() : date.getMinutes();

	let date_str = `${month}/${day} - ${hours}:${minutes}`;

	return date_str;
}
/*
@info: check the given file extension for check it is a video
@return: boolean 
*/
function is_video(filename){
	filename = filename.toLowerCase();
	condition = 
	filename.endsWith('.mp4') ||
	filename.endsWith('.webm') ||
	filename.endsWith('.mkv') ||
	filename.endsWith('.mpg') ||
	filename.endsWith('.m4v');
	return condition;
}
/*
@info: check the given file extension for check it is a image
@return: boolean 
*/
function is_image(filename){
	filename = filename.toLowerCase();
	condition =  
	filename.endsWith('.jpg') ||
	filename.endsWith('.png') ||
	filename.endsWith('.jpeg') ||
	filename.endsWith('.gif') ||
	filename.endsWith('.bat');
	return condition;
}

/*
@filter: array ( contains the keys of type block to show );
@info: based on the form structure defined in index.js it populates the form with all the necessary fields of the page
*/
function populate_form(){
	filter_ = FORM_FILTERS[getCurrentPageName()];
	let write = false;
	let form = get_page_form();
	if(!form) return;
	form.empty();
	let col_val = 'medium-6 column end';
	for ([key, value] of Object.entries(ProfilesDatas['settingsScheme'])) {   

		if(filter_ && value.type == 'block') {
			if(filter_.includes(key)){
				write = true;
			} else {
				write = false;
			}
		} else if( !filter_){
			write = true;
		}
		if(!write) continue;

      	key_upper = key.split("_").join(" ").toUpperCase() 
      	let elem;
      	let style;

    	if (value.type == 'nr') continue 
        else if (value.type == 'di') { 
        	elem = $(`<div id=${value.container_id}></div>`);
        } 
        
        else if (value.type == 'block') { 
        	elem = $(`
        		<div class="field medium-12 column"> 
		            <div class="title">
		              <h3>
		                ${key_upper}
		              </h3> 
		            </div>
		        </div>
        	`);
          
        }
        else if (value.type == 't') { 
        	elem = $(`
        		<div class="field ${col_val}" >
		            <div class="input-container">
			            <span>
			              <input class="slide-up" id="prof_${key}" data-input="${key}" type="text"  />
			              <label for="prof_${key}">
			                <span data-tooltip aria-haspopup="true" class="has-tip tip-top radius" title="${value.description}">
			                	${key_upper}
			                </span>
			              </label>
			            </span>
		            </div>
		        </div>
        	`);
        } 
        else if (value.type == 'at') { 
         	elem = $(`
         		<div class="field ${col_val}" >
		          <label for="prof_${key}">
		            <span data-tooltip aria-haspopup="true" class="has-tip tip-top radius" title="${value.description}">
		              ${key_upper}
		              <i class="far fa-question-circle"></i>
		            </span>
		          </label>

		        </div>
         	`);

         	if (value.render && value.render == "textarea") {
		        elem.append($(`<textarea id="prof_${key}" data-input="${key}" rows="5"></textarea>`));
	        } else {
	            elem.append($(`<input type="text" id="prof_${key}" data-input="${key}">`))
	        }
        } 
        else if (value.type == 'n') { 
        	elem = $(`

        		<div class="field ${col_val}">

			        <div class="input-container">
			            <span>
			                <input class="swing" type="number" id="prof_${key}" data-input="${key}">
			                <label for="prof_${key}">
				                <span data-tooltip aria-haspopup="true" class="has-tip tip-top radius" title="${value.description}">
				                	${key_upper}
				                </span>
			                </label>
			            </span>
			        </div>
		        </div>
        	`);
        } 
        else if (value.type == 'c') { 
        	elem = $(`
        		<div class="field check ${col_val}">
		            <label class="checkbox-container" for="prof_${key}">
		                <label class="checkbox path">
		                    <input type="checkbox" id="prof_${key}" data-input="${key}">
		                    <svg viewBox="0 0 21 21">
		                    	<path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
		                    </svg>
		                </label>
		                <span data-tooltip aria-haspopup="true" class="has-tip tip-top radius" title="${value.description}">
		                	${key_upper}
		                	<i class="far fa-question-circle"></i>
		                </span>
		            </label>
		        </div>
        	`);
        } 

        if (value.type == 't' || value.type == 'n') {
        	let style_string = `
        	<style type="text/css">
            	#prof_${key}:focus, #prof_${key}:active{
            		text-indent:0;
            	}
        	`
            /*if there are more than 10 words it sets fixed width*/
            if (key.length > 10) {
                /*if there are more than 3 words it sets the height of the label and container for fit*/
                if (key.length > 15) {
                    style_string += `
                    	#prof_${key} , #prof_${key} + label{
                    		height: 70px;
                    	}
                    `
                } else if (key.length >= 12) { 
                	style_string += `
                    	#prof_${key} , #prof_${key} + label{
                    		height: 50px;
                    	}
                    `   
                } 
                style_string += `
                	#prof_${key} + label{
						width: 140px;
					}
					#prof_${key}{
						text-indent: 140px; 
					}
                `
                } else { 
                	/*if are less than 10 letters it cacls the letter spacing for the input text when it is out of focus*/
	                style_string += `
	                	#prof_${key}{
                    		text-indent: calc(30px + ${key.length * 11.5}px); 
                    	}
	                `
                } 
                
              style_string += '</style>';
              style = $(style_string);
        }
        if(elem){
        	form.append(elem);
        	elem = null;
        }
        if(style){
        	form.append(style);
        	style = null;
        }
    } 
}

/*
@info: read the current user 
@return: string (User name)
*/
function getCurrentUser(){
	return ProfilesDatas["currentProfile"]
}
/*
@info: read the current user settings
@return: object (User settings)
*/
function getCurrentSettings(){
	return ProfilesDatas[getCurrentUser()]["profile"];
}
function getProfileSettings(profile){
	return ProfilesDatas[profile]["profile"];
}
function setProfileSettings(profile, settings){
	ProfilesDatas[profile]["profile"] = settings;
}
/*
@info: read the current user datas
@return: object (User datas)
*/
function getCurrentObject(){
	return ProfilesDatas[getCurrentUser()];
}
/*
@info: read the datas of the given profile
@return: object (User datas)
*/
function getProfileObject(profile){
	return ProfilesDatas[profile];
}
/*
@info: read the current user bot
@return: instabot object (User settings)
*/
function getCurrentBot(){
	return ProfilesDatas[getCurrentUser()]["bot"]
}
function setCurrentBot(bot){
	return ProfilesDatas[getCurrentUser()]["bot"] = bot;
}
function getProfileBot(profile){
	// ProfilesDatas[currentProfile] is null when new user is created
	if(!ProfilesDatas[profile]) return null;
	return ProfilesDatas[profile]["bot"]
}
function setProfileBot(profile, bot){
	return ProfilesDatas[profile]["bot"] = bot;
}
function deleteCurrentBot(){
	delete ProfilesDatas[getCurrentUser()]["bot"];
}
function deleteProfileBot(profile){
	delete ProfilesDatas[profile]["bot"];
}
function getProfileFlPath(profile){
	return PROFILES_FOLDER + profile + '.txt';
}
/*
@info: read the current open page
@return: Jquery object
*/
function getCurrentPage(){
	return ProfilesDatas["currentPage"];
}
/*
@info: read the current open page
@return: string
*/
function getCurrentPageName(){
	return ProfilesDatas["currentPageName"];
}
/*
@info: read the shared datas between profiles
@return: object
*/
function getShared(){
	return ProfilesDatas["shared"];
}

function getCurrentUsedFilePath(){
	let currentProfile = getCurrentUser();
	return ProfilesDatas[currentProfile]["used_images_fl"];
}
/*
@info: read the current user and it's settings
@return: [User name, User settings, User settings file path]
*/
function getCurrentUserDatas(){
	let currentProfile = getCurrentUser();
	// ProfilesDatas[currentProfile] is null when new user is created
	if(!currentProfile || !ProfilesDatas[currentProfile]){
		return [null, null, null]
	}
	return [currentProfile, ProfilesDatas[currentProfile]["profile"], getCurrentObject()["profile_fl"]]
}
function getUserAvatarPath(user){
	return getAvatarPath(getProfileSettings(user)["profile_avatar"]);
}
function getCurrentUserAvatar(){
	return getProfileSettings(getCurrentUser())["profile_avatar"];
}
function getCurrentUserAvatarPath(){
	return getAvatarPath(getProfileSettings(getCurrentUser())["profile_avatar"]);
}
/*
@info: get the name of all saved profiles
@return: array of string ( contains the profiles names )
*/
function getAllProfiles(){
	let profiles = [];
	let files = get_files(PROFILES_FOLDER);
	for (let i=0; i<files.length; i++){
		let file = files[i];
		file = file.substring(0, file.length - 4);
		profiles.push(file);
	}
	profiles.remove("default");
	profiles.remove("test");
	return profiles;
}

/*
@avatar: string 
@info: return the avatar path of a given avatar
*/
function getAvatarPath(avatar){
	return `../../${AVATARS_FOLDER}/${avatar}`;
}

/*
@info: get the closes <select> tag in the active page
@return: 
	- the found <select> tag if found
	- null if not found
*/
function get_page_profiles_select(){
	let profiles_all = $('.selectem.profiles');
	for(let i= profiles_all.length - 1; i >= 0; i--){
		let profiles = $(profiles_all[i]);
		let page_parent = profiles.closest("div.page");
		if (page_parent.css("display") == "block"){
			return profiles;
		}
	}
	return null;
}

/*
@info: get the closes .form tag in the active page
@return: 
	- the found .form tag if found
	- null if not found
*/
function get_page_form(){
	let forms = $('.form');
	for(let i= forms.length - 1; i >= 0; i--){
		let form = $(forms[i]);
		let page_parent = form.closest("div.page");
		if (page_parent.css("display") == "block"){
			return form;
		}
	}
	return null;
}

/*
@info: add to the active page select the list of profiles
*/
function populate_profiles(){
	let users = getAllProfiles();
	let profiles = get_page_profiles_select();

	if (!profiles) return;
	profiles = profiles.find(".selectem-items");
	profiles.empty();

	for (let i=0; i<users.length; i++){
		let user = users[i];
		let avatar = getProfileSettings(user)["profile_avatar"];

		let option = $(`
			<li data-val="${user}">
                <span class="item-avatar">
                	<img src="${getAvatarPath(avatar)}" alt="${avatar}" />
                </span>
                <span class="item-label">
                  ${user}
                </span>
         	</li>
        `);
		
    	profiles.append(option);
	}
}

/*
@profile: string
@info: select the given profile in the current select profile dropdown in the gui
*/
function select_profile(profile){
	let parent = get_page_profiles_select();
	let input = parent.find(".selectem-value");
	input.val(profile);
	input.change();
	parent.find(".selectem_label .name").text(profile);
}

/*
@post: array
@schedule: list of array
@info: compare the arrays in the list with the given one and check if they are equal
	   if yes they are removed from the list of arrays
*/
function check_if_post_in_schedule_and_remove_it(schedule, post){
	for(let i = 0; i < schedule.length; i++){
		let current = schedule[i];
		if(arraysEqual(current, post)){
			schedule.remove(current);
			return schedule;
		}
	}
}


/*
@info: fill the inputs in the current page with the selected profile datas
*/
function populate_inputs(){
	let [currentUser, currentSettings, currentSettingsPath] = getCurrentUserDatas();
	for ([key, value] of Object.entries(ProfilesDatas['settingsScheme'])){

		if( value.type == 'nr' || value.type == 'block') continue;

		let type = value.type;
		let data = currentSettings[key];

		let field = getCurrentPage().find(`[data-input="${key}"]`);
		if (!field.length > 0) continue;
		
		if ( type == 'c' ){
			field.prop('checked', data === true);
		} else if (type == 't') {
			field.val(data);
		} else if (type == 'n') {
			field.val(data);
		} else if (type == 'at') {
			if(!data) continue;
			field.val(data.join(' & '));
		}		
	}
}

/*
@info: reset the selected profile and clear the inputs
*/
function reset(){
	resetCurrentProfile();
	reset_fields()
}

function resetCurrentProfile(){
	ProfilesDatas["currentProfile"] = null;
	let profiles = get_page_profiles_select();
	let input = profiles.find('.selectem-value');
	input.val("default");
	profiles.find(".selectem_label .name").text("default");
}

/*
@info: clear the inputs
*/
function reset_fields(){
	populate_profiles();
	// $("#profile-name").val(""); 
	// $("#profile-name") non serve resettarlo, se un utente scrive un nome per la creazione di un profile
	// e l'inizio è uguale a un profilo già esistente allora vengono popolati i campi, se li vuole resettare
	// usa il clear ma non deve cancellare anche il nuovo nome del profilo
	for ([key, value] of Object.entries(ProfilesDatas['settingsScheme'])){
		if( value.type == 'nr' || value.type == 'block') continue;
		let type = value.type;
		if (type == 'di') {
			$(`#${value.container_id}`).empty();
		}
		let field = getCurrentPage().find(`[data-input="${key}"]`);
		if (!field.length > 0) continue;
		if ( type == 'c' ){
			field.prop('checked', false);
		} else if (type == 't') {
			field.val('');
		} else if (type == 'n') {
			field.val('');
		} else if (type == 'at') {
				field.val('');		
		}
	}
	$('.left-medias').val(0);
}

/*
@info: read the fields and update the setting file of the user
*/
function send_inputs(){
	let [currentUser, currentSettings, currentSettingsPath] = getCurrentUserDatas();
	let settingsScheme = ProfilesDatas['settingsScheme'];
	let newUserCreation = false;
	// if the settings are null the creation of a new user is supposted
	if(!currentSettings){
		currentUser = getCurrentUser();
		newUserCreation = true;
		ProfilesDatas[currentUser] = {};
		currentSettings = ProfilesDatas[currentUser]["profile"] = {};
		currentSettingsPath = getProfileFlPath(currentUser);
	}
	for ([key, value] of Object.entries(settingsScheme)){
		
		if( value.type == 'block') continue;
		let type = value.type;

		if (type == 'nr') {
			if(!currentSettings[key]){
				currentSettings[key] = 0;
				if(settingsScheme[key]['default']){

					if(settingsScheme[key]['default'] == "[]") {
						currentSettings[key] = [];
					} else if(settingsScheme[key]['default'] == "{}") {
						currentSettings[key] = {};
					} else {
						currentSettings[key] = settingsScheme[key]['default'];
					}

					
				}
				if(key == 'session_id'){
					let last_id = ProfilesDatas["shared"]["session-id-counter"] + 1;
					ProfilesDatas["shared"]["session-id-counter"] = last_id;
					write_file(ProfilesDatas["shared_fl"], JSON.stringify(getShared()));
					currentSettings[key] = last_id;
				}
				if(key == 'profile_avatar'){
					currentSettings[key] = random_avatar();
				}
			}
			
		} else if (type == 'di') {
			if (!currentSettings[key]){
				currentSettings[key] = new Object();
			}
		}

		let field = ProfilesDatas["currentPage"].find(`[data-input="${key}"]`);
		if (!field.length > 0) continue;
	
		if ( type == 'c' ){
			currentSettings[key] = field.prop('checked');
		} else if (type == 't') {
			currentSettings[key] = field.val();
		} else if (type == 'n') {
			let val = field.val();
			if(!val){
				if(settingsScheme[key]['default']) val = parseInt(settingsScheme[key]['default']);
				else val = 0;
			}
			currentSettings[key] = val;
		} else if (type == 'at') {
			let values = field.val().split('&');
			
			for (let i = 0; i < values.length; i++) {
				values[i] = values[i].trim();
			}
			if(values.length == 1 && values[0] == "") values = [];
			currentSettings[key] = values;
		}
	}
	write_file(currentSettingsPath, JSON.stringify(currentSettings));

	// the other profile files are created
	if(newUserCreation){
		checkProfileDatas(currentUser, ProfilesDatas);
	}
}

/*
@info: Count the used images of the selected profile
@return: int (the remaining images to use)
*/
function left_images_counter(){
	let user = getCurrentUser();
	let used_path = getCurrentObject()["used_images_fl"];
	let hashtags_ = getCurrentSettings()["hashtags"];
	let used;
	let tot_count = 0;

	if(exists_file(used_path)){
		used = read_file(used_path);
		used = JSON.parse(used)[0];
	} else {
		used = 0;
	}

	for (let i = 0; i<hashtags_.length; i++){
		let hashtag = hashtags_[i];
		let path = DOWNLOAD_FOLDER + hashtag + '.txt';
		if(!exists_file(path)) continue;
		let files = JSON.parse(read_file(path));
		tot_count += files['count'];
	}
	return tot_count - used > 0 ? tot_count - used : 0;
}

/*
@info: check if the selected user is already an active bot
@return: boolean
*/
function is_running(profile) {
	if(!profile) profile = getCurrentUser();
	let bot = getProfileBot(profile)
	if(bot){
		return bot.is_open();
	}
	return false;
}

/*
@info: stop the bot of the selected profile
*/
function stop_bot(profile){
	if(!profile) profile = getCurrentUser();
	if(!is_running(profile)) return;
	let bot = getProfileBot(profile);
	if( bot ){
		bot.close();
		deleteProfileBot(profile);
		setProfileBotStatus(profile); // set the dashboard status
	}
	
}

/*
@info: run the bot of the selected profile
*/
function run_bot(profile){
	if(!profile) profile = getCurrentUser()
	if ( profile == 'test' ) return;
	if(getProfileBot(profile)){
		if(is_running(profile)){
			show_popup(profile, 'profile busy', getUserAvatarPath(profile), "This profile is busy with other active tasks, stop them and run it again");
		} else {
			getProfileBot(profile).run();
			setProfileBotStatus(profile); // set the dashboard status
		}
	} else {
		let bot = new instabot(profile);
		setProfileBot(profile, bot);
		bot.run();
		setProfileBotStatus(profile); // set the dashboard status
	}
	
}

/*
@info: when the profile is changed its avatar is used as profiles page icon
*/
function changeProfilesIcon(url){
	get_page_profiles_select().find(".selectem_label .icon.contain-image").css("background-image", `url('${url}')`);
	$(".page-icon.profiles-icon").css("background-image", `url('${url}')`);
}

/*
@info: replace all the occurences of a char in a given string
@string_: string
@char_: string, the char to replace
@replace_: string, the char to insert
*/
function replaceAllChars(string_, char_, replace_){
	return string_.split(char_).join(replace_);
}

///////////////////////////////////
//////////// BOT FUNCTIONS  ///////
//////////////////////////////////

// Generates a random integereger in range [min, max]
function randomRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //Il max è incluso e il min è incluso 
}

// sleep for the given ms
// ms: int
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function is_numeric(str){
    return /^\d+$/.test(str);
}

// resolve the promise once that the user has wrote
// and sent the code in the alert-input box.
// check alert.js
function get_alert_input(){
	return new Promise(async resolve => {
		while( WARNING_INPUT_NOT_SENT ){
			await sleep(1000);
		}
		WARNING_INPUT_NOT_SENT = true;
		resolve(WARNING_INPUT_CODE.trim());
	});
    
};

/*
@source: string ( the path of the file to copy )
@dest: string ( the path of the file where to copy )
@info: copy a file from a source path to a dest path
*/
function copyFile(source, dest){
	console.log(source, dest);
	return new Promise(async resolve => {
		let readStream = fs.createReadStream(source);
		let writeStream = fs.createWriteStream(dest);

		readStream.pipe(writeStream);

	    readStream.once('end', () => {
			resolve(true);
		});
	});
}

/*
@captions: array of strings
@return: string ( a random string from the given array )
*/
function random_caption(captions){
	let len = captions.length;
	return captions[randomRange(0, len - 1)];
}

/*
@info: check if the selected profile is a valid one
@return: boolean
*/
function is_valid_profile(){
	if(!getCurrentUser() || getCurrentUser() == "default"){
		show_popup('wiinsta', 'invalid profile', LOGO_PATH, "Select a profile");
		return false;
	}
	return true;
}


//////////////////////////////////////////////////
//////////// POSTS/STORIES FUNCTIONS  ////////////
//////////////////////////////////////////////////

/*
data-id
data-filePath
data-fileType
data-fileCode
data-fileHashtag
data-ms

POST OBJECT --> {"caption":"hey","file":{"path":"/home/pero/Scaricati/logo.jpg","type":"image"},"tags":["ciao"]}


data-id
data-filePath
data-fileType
data-fileCode
data-fileHashtag
data-ms

POST OBJECT --> {"caption":"hey","file":{"path":"/home/pero/Scaricati/logo.jpg","type":"image"},"tags":["ciao"]}
*/


/*
@post: jquery object
@info: modify some inner objects styles inside the given post
*/
function edit_post(post){
	let input = post.find("input");
	let textarea = post.find("textarea");
	let edit = post.find(".icon.edit");
	let cancel_edit = post.find(".icon.cancel-edit");
	let confirm_edit = post.find(".icon.confirm-edit");
	let uplaod = post.find(".icon.upload");

	input.removeAttr("disabled");
	if (textarea) textarea.removeAttr("disabled");

	edit.css("display", "none");
	cancel_edit.css("display", "block");
	confirm_edit.css("display", "block");
	uplaod.css("display", "block");
}

/*
@post: jquery object
@info: modify some inner objects styles inside the given post
@return: null
*/
function view_post(post){
	let input = post.find("input");
	let textarea = post.find("textarea");
	let edit = post.find(".icon.edit");
	let cancel_edit = post.find(".icon.cancel-edit");
	let confirm_edit = post.find(".icon.confirm-edit");
	let uplaod = post.find(".icon.upload");

	input.attr("disabled", "true");
	if (textarea) textarea.attr("disabled", "true");
	edit.css("display", "block");
	cancel_edit.css("display", "none");
	confirm_edit.css("display", "none");
	uplaod.css("display", "none");
	return null;
}

/*
@post: jquery object
@obj: object (scheduled posts object)
@info: 
	- remove the jquery object 
	- delete the connected scheduled post element
	- remove the media to the used files
*/
function delete_post(post, obj){
	console.log("deleting", post)
	let id = post.attr("data-id");
	let date_ms = post.attr("data-ms");
	if(obj[date_ms]){
		let to_remove = obj[date_ms][id].file.code ? obj[date_ms][id].file.code : obj[date_ms][id].file.path; // if is downloaded media uses the code, else the local abs path.
		remove_file_from_used_list(null, to_remove);
		obj[date_ms].splice(id, 1);
		if(obj[date_ms].length == 0){
			delete obj[date_ms];
		}
	} else {
		post.remove();
	}

 	
 	let [currentUser, currentSettings, currentSettingsPath] = getCurrentUserDatas();
	write_file(currentSettingsPath, JSON.stringify(currentSettings));

	post.remove();
	show_popup(getCurrentUser(), 'invalid caption', getCurrentUserAvatarPath(), "succesfully deleted element");
	if(is_page("posts")){
		clear_posts_container();
		populate_posts();
	} else if (is_page("stories")){
		clear_stories_container();
		populate_stories();
	}
	return null;
}

/*
@info: clear the post container
*/
function clear_posts_container(){
	$(".lista-posts").empty();
}

/*
@post: jquery object
@path: string (image/video path or url)
@type: string ( image/video )
@info: add to the jquery object the given image/video
*/
function add_file_to_post(post, path, type){
	post.find(".post-image img").remove();
	post.find(".post-image video").remove();
	if(type == "image"){
		let image  = $("<img>");
		image.attr("src", path);
		post.find(".post-image").prepend(image);
	} else if (type == "video"){
		let video  = $("<video controls></video>");
		video.attr("src", path);
		post.find(".post-image").prepend(video);
	}
}

function get_posts_random_file(profile, hashtags_){
	let [code, upload, type, owner, caption, random_hashtag] = random_file_to_upload(profile, hashtags_);
	upload = replaceAllChars(upload.trim(), " ", "%20");
	return [code, upload, type, owner, caption, random_hashtag];
}


/*
@file: string ( code of the downloaded media OR abs path of the local file)
@info: remove the given file from the used files
*/
function remove_file_from_used_list(profile, file){
	file = replaceAllChars(file.trim(), "%20", " ");

	if(!profile) profile = getCurrentUser();
	let used_path = getProfileObject(profile)["used_images_fl"];
	if(!exists_file(used_path)) return;
	let used = read_file(used_path);
	used = JSON.parse(used);
	used.remove(file);
	if( used[0] > 0 ) used[0] --;
	write_file(used_path, JSON.stringify(used));
}

function add_file_to_used_list(profile, file){
	file = replaceAllChars(file.trim(), "%20", " ");

	if(!profile) profile = getCurrentUser();
	let used_path = getProfileObject(profile)["used_images_fl"];
	if(!exists_file(used_path)) return;
	let used = read_file(used_path);
	used = JSON.parse(used);
	used.push(file);
	used[0] ++;
	write_file(used_path, JSON.stringify(used));
}

function check_file_in_used_list(profile, file){
	file = replaceAllChars(file.trim(), "%20", " ");

	if(!profile) profile = getCurrentUser();
	let used_path = getProfileObject(profile)["used_images_fl"];
	if(!exists_file(used_path)) throw ({'No file found':'The used file not exists'});
	let used = read_file(used_path);
	used = JSON.parse(used);
	return used.includes(file);
}




//////////////////////////////////////////
//////////// STATS FUNCTIONS  ////////////
//////////////////////////////////////////

/*
<canvas id="myChart" width="400" height="400"></canvas>
    <script>
var ctx = document.getElementById('myChart');
var myChart = new Chart(ctx, {
    type: 'line', horizontalBar
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange', 'pink'],
        datasets: [{
            label: '# of',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});
</script>

*/

// initialize charts
var CHARTS = {};
function init_charts(obj){
	if(Object.keys(CHARTS).length) return;
	console.log(obj);
	let currentUser = getCurrentUser();
	let summary_stats = $('.summary-stats .bxslider');
	for ([stat, value] of Object.entries(obj)){
		if(NO_RENDER_GRAPHS.includes(stat)) continue;
		let column = $(`
		<li class="column medium-12 end"> 
			<h3> ${stat} </h3>
		</li>`);
		let graph = $(`<canvas id="${currentUser + '-' + stat}" width="110" height="100" aria-label="Hello ARIA World" ></canvas>`);
		column.append(graph);
		summary_stats.append(column);

		let myPieChart = new Chart(graph);
		CHARTS[stat] = [graph, myPieChart];

	}

	let column = $(`
		<li class="column medium-12 end"> 
			<h3> Today </h3>
		</li>`);
	let today_graph = $(`<canvas id="${currentUser + '-today'}" width="110" height="100" aria-label="Hello ARIA World" ></canvas>`);
	column.append(today_graph)
	summary_stats.prepend(column);
	let myPieChart = new Chart(today_graph);
	CHARTS["today"] = [today_graph, myPieChart];

	$('.bxslider').bxSlider();

	$( window ).resize(function() {
		$('.bx-viewport').css("height", "auto");
	});
};

/*
@info: get the selected user stats and populate the cahrts by parsing the stats
*/
function draw_stats(){
	let [currentUser, currentSettings, currentSettingsPath] = getCurrentUserDatas();
	let path = getCurrentObject()["stats_fl"];
	if(!exists_file(path)){
		show_popup(getCurrentUser(), 'empty stats', getCurrentUserAvatarPath(), "This profile have no stats to show");
		return;
	}

	let global_stats = getCurrentObject()["stats"];		// get the stats object

	let keys = Object.keys(global_stats);	// get the stats days
	if( keys.length <= 1 ) {
		show_popup(getCurrentUser(), 'few datas', getCurrentUserAvatarPath(), "This profile have too few datas to show its stats");
		return;
	};
	init_charts({
                "posts": 0,
                "following": 0,
                "followers": 0,
                "likes": 0,
                "comments": 0,
                "follow": 0,
                "unfollow": 0,
                "visited": 0,
                "public": 0,
                "private": 0,
                "noPost": 0,
                "messages": 0
            });

	let days = [];
	let datas = {};
	
	let today_labels = [];
	let today_graph_datas = [];
	let today_graph_backgrounds = [];
	let today_graph_borders = [];
	let today_stats_datas =  {
	    type: 'bar',
	    data: {
	        labels: today_labels,
	        datasets: [{
	            label: 'Today',
	            data: today_graph_datas,
	            backgroundColor: today_graph_backgrounds,
	            borderColor: today_graph_borders,
	            borderWidth: 1
	        }]
	    }
	}

	//console.log(datas)
	// populate the 'days' array and the 'datas' object with the 'global_stats' informations
	for ([day, stats] of Object.entries(global_stats)){
		days.push(day);

		for ([stat, value] of Object.entries(stats)){

			if(NO_RENDER_GRAPHS.includes(stat)) continue;
			if(!datas[stat]) datas[stat] = [];
			datas[stat].push(value);
			// console.log(stat, datas[stat])
		}
	}
	// console.log(datas)

	// if there are more than 4 days it removes the default values
	if(keys.length >= 4){
		days.splice(0, 2);
		for ([stat, values] of Object.entries(datas)){
			if(values >= 4 ) values.splice(0, 2);
		}
	}
	else days = ["", ""];

	labels_to_display = 6;
	increment = parseInt(days.length/labels_to_display);
	if( !increment ) increment = 1;

	// get the 6 labels to display
	for(let i=0; i < days.length; i+=increment){
		for(let n=1; n<increment; n++){
			if((i + n) >= days.length ) break;
			days[i + n] = "";
		}
	}

	for ([stat, values] of Object.entries(datas)){

		today_labels.push(stat);
		today_graph_datas.push(values[values.length - 1]);
		let color = `${randomRange(0, 255)}, ${randomRange(0, 255)}, ${randomRange(0, 255)}`
		today_graph_backgrounds.push(`rgba(${color}, 0.2)`);
		today_graph_borders.push(`rgba(${color}, 1)`);
		let chart_datas = {
		    type: 'line', 
		    data: {
		        labels: days,
		        datasets: [{
		            label: `${stat}`,
		            data: values,
		            backgroundColor: `rgba(${color}, 0.2)`,
		            borderColor: `rgba(${color}, 1)`,
		            borderWidth: 1
		        }]
		    },
		    options: {
		        scales: {
		            yAxes: [{
		                ticks: {
		                    beginAtZero: true
		                }
		            }]
		        }
		    }
		};
		CHARTS[stat][1].destroy();
		CHARTS[stat][1] = new Chart(CHARTS[stat][0], chart_datas);
	}
	
	CHARTS["today"][1].destroy();
	CHARTS["today"][1] = new Chart(CHARTS["today"][0], today_stats_datas);
}

function clear_stats_container(){
	$('.summary-stats .bxslider').empty();
}


//////////////////////////////////////////
//////////// LOGS FUNCTIONS  /////////////
//////////////////////////////////////////

function populate_logs(filter){
	
	// log types: error, info, success, warning
	if(!filter) filter = "all";
	let [currentUser, currentSettings, currentSettingsPath] = getCurrentUserDatas();
	let logs_path = getCurrentObject()["logs_fl"];
	if(!exists_file(logs_path)){
		show_popup(getCurrentUser(), 'no logs', getCurrentUserAvatarPath(), "No logs found");
		return;
	}
	let parent = $('.logs-container');
	let logs = getCurrentObject()["logs"];
	let times = Object.keys(logs).sort((a, b) => {return a - b;});
	for( let i=0; i<times.length; i++){
		let time = times[i];
		let type = logs[time][0];
		let text = logs[time][1];
		if( (filter != "all") && (type != filter) ) continue;
		let message = $(`
			<div class="column medium-6 large-4 end">
			<div class="alert-box ${type} radius">
		       ${ms_to_date_str(time)}: ${text}
		    </div>
		    </div>
		`);
		parent.prepend(message);
	}
}

function clear_logs(){
	$('.logs-container').empty();
}



//////////////////////////////////////////
//////////// DASHBOARD  /////////////
//////////////////////////////////////////

function random_avatar(){
	let avatars = get_files_and_folders(app.getAppPath() + '/' + AVATARS_FOLDER); // get_files() return errors. without app.getAppPath() it gives also errors.
	let randomAvatar = String(randomRange(1, 9)) + '.png';
	return randomAvatar;
}

function getProfileBotStatus(profile){
	let bot = getProfileBot(profile);
	if(is_running(profile)){
		return "on";
	}
	return "off";
}

function setProfileBotStatus(profile){
	let status_ball = $(`.page.dashboard .card[data-profile="${profile}"] .status`);
	status_ball.removeClass("on", "off");
	status_ball.addClass(getProfileBotStatus(profile));
}

function populate_dashboard(filter){
	let profiles = getAllProfiles();
	let cardsContainer = $('.dashboard .cardsContainer');
	for ( let i = 0; i < profiles.length; i ++){
		let profile = profiles[i];
		let settings = getProfileSettings(profile);

		let avatar = settings["profile_avatar"];
		let image = settings["profile_image"] ? settings["profile_image"] : "../../public/img/profiles.png";
		if(!avatar){
			avatar = settings["profile_avatar"] = random_avatar();
			setProfileSettings(profile, avatar);
			write_file(ProfilesDatas[profile]["profile_fl"], JSON.stringify(settings));
		}

		let followers = settings["today_followers"] ? settings["today_followers"] : 0;
		let following = settings["today_following"] ? settings["today_following"] : 0;
		let profile_card = $(`
			 <div class="card" data-profile="${profile}">
		        <div class="banner" style="background-image: url('${getAvatarPath(avatar)}');">
		          <div class="status ${getProfileBotStatus(profile)}"></div>
		          <div class="icon contain-image" style="background-image: url('${image}')"></div>
		        </div>
		        <h2 class="name">${profile}</h2>
		        <div class="actions">
		            <div class="follow-info">
		                <h2><a href="#"><small>Followers</small><span>${followers}</span></a></h2>
		                <h2><a href="#"><small>Following</small><span>${following}</span></a></h2>
		            </div>
		            <div class="overview">
		              <div class="info">
		                <span data-tooltip aria-haspopup="true" class="has-tip tip-top radius" title="Run the profile bot">
		                  <div class="icon small spaceship-icon run"></div>
		                </span>
		              </div>
		              <div class="info">
		                <span data-tooltip aria-haspopup="true" class="has-tip tip-top radius" title="Stop the profile bot">
		                  <div class="icon small asteroid-icon stop"></div>
		                </span>
		              </div>
		              <div class="info">
		                <div class="circle-background"></div>
		                <span data-tooltip aria-haspopup="true" class="has-tip tip-top radius" title="Weekly followers increase [ in development ]">
		                  <div class="icon small up-icon"></div>
		                </span>
		              </div>
		              <div class="info">
		                <div class="circle-background"></div>
		                <span data-tooltip aria-haspopup="true" class="has-tip tip-top radius" title="Profile Errors/warnings [ in development ]">
		                  <div class="icon small warning-icon logs"></div>
		                </span>
		              </div>
		            </div>
		        </div>
		      </div>
		`);
		cardsContainer.append(profile_card);
	}
}

function clear_dashboard(){
	$('.dashboard .cardsContainer').empty();
}
