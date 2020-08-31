window.addEventListener("load", start);

function start(){
	var delete_button_active = null;
	let post;
	$('#random-stories-date').val(ms_to_iso(Date.now()));
	// MODIFICA L'ICONA E ABILITA IL LINK QUANDO SI VUOLE ELIMINARE UNA DOMANDA
	$("body").click( evt => {

		if(is_page("stories")){
			let target = $(evt.target); // elemento cliccato
			// controlla se un bottone delete.alert e' stato gia' cliccato, se si ne rimuove la classe alert
			if(delete_button_active && target[0] != delete_button_active[0]){
				delete_button_active.removeClass("remove-alert");
				delete_button_active.removeClass("delete-post");
				// rimette il bottone attivo a null
				delete_button_active = null;
			}

			// se il target del clicc e' un icona delete ci aggiunge la classe alert
			if (target.is(".icon.delete") && !target.hasClass("remove-alert")){
				delete_button_active = target;
				target.addClass("remove-alert");
				setTimeout( () => {
					// se il target ha ancora classe remove dopo 1s modifica l'href altrimenti si blocca
					if (!target.hasClass("remove-alert")) return; 
					target.addClass("delete-post");
				}, 500);
			} 

			if(target.is(".icon.edit") || target.is(".icon.cancel-edit") ){
				post = target.closest(".post");
				if(target.is(".icon.edit")){
					edit_post(post);
				} else if(target.is(".icon.cancel-edit")){
					post = view_post(post); // mette la variabile post = null;
				}
			}

			if(target.is(".icon.upload")){
				if(!post) return;
				upload_image(post);
			}

			if(target.is(".icon.confirm-edit")){
				if(!post) return;
				post = save_story(post); // mette la variabile post = null se il save è effettuato correttamente
			}

			if(target.is(".icon.delete-post")){
				post = target.closest(".post");
				if(!post) return;
				post = delete_post(post, getCurrentSettings()["scheduled_stories"]); // mette la variabile post = null se il save è effettuato correttamente
				
			}
		}
	});

	$(".add-story").click( evt => {
		create_story();
	});

	$(".random-stories").click( evt => {
		if(!is_valid_profile()) return;
		let num = $("#random-stories-count").val();
		if(!num || num == 0){
			show_popup(getCurrentUser(), 'missing setting', getCurrentUserAvatarPath(), "write the number of stories to generate");
			return;
		}
		let start_date = $("#random-stories-date").val();
		let start_date_iso = new Date(start_date);
		let start_date_ms = start_date_iso.getTime();
		if(!is_numeric(start_date_ms)){
			show_popup(getCurrentUser(), 'missing setting', getCurrentUserAvatarPath(), "select a valid date for start the generation of the stories");
			return;
		}
		let [profile, currentSettings, currentSettingsPath] = getCurrentUserDatas();
		let num_days = $('#random-stories-days').val();
		let day_increase = 1000 * 60 * 60 * 24;
		let increase_ms = currentSettings["random_story_delay"] * 60 * 1000;

		for(let day = 0; day < num_days; day ++){
			for (let i=0; i < num; i++){
				let hashtags_ = currentSettings["hashtags"];
				let [code, upload, type, owner, caption, random_hashtag] = get_posts_random_file(profile, hashtags_);
				if(!upload) {
					show_popup(getCurrentUser(), 'empty valid media', getCurrentUserAvatarPath(), "this profile has alreasy used all the medias relative to its hashtags");
					return;
				};
				
				let post_obj = {
					"file":{"source":"url","path": upload, "code": code, "type": type, "hashtag": random_hashtag}
				};

				let increasedHours = increase_ms * i;
				let increasedDays = day * day_increase;
				let current_post_date = start_date_ms + increasedHours + increasedDays;
				
				post = create_story(current_post_date, post_obj);
				save_story(post);
			}
		}
	});

	$('.selectem-value').change( evt => {
		let type = $("select.type").val().trim();
		if (!is_page("stories")) return;
		if(getCurrentUser() == "default"){
			show_popup('wiinsta', 'success', LOGO_PATH, "select a profile");
		} else {
			clear_stories_container();
			populate_stories();
		}
	});

	$(".delete-stories").click( evt => {
		if(!is_valid_profile()) return;
		getCurrentSettings()["scheduled_stories"] = {};
		write_file(getCurrentObject()["profile_fl"], JSON.stringify(getCurrentSettings()));
		clear_stories_container();
		populate_stories();
		show_popup(getCurrentUser(), 'success', getCurrentUserAvatarPath(), "All stories were correctly deleted");
	});

}


/*
@post: jquery object
@info: add the created story ot the scheduled object and save it to the file
*/
function save_story(post){
	if(is_running()){
		show_popup(getCurrentUser(), 'busy profile', getCurrentUserAvatarPath(), "The selected profile is currently running, stop it for create new scheduled medias");
		return;
	}
	let [currentUser, currentSettings, currentSettingsPath] = getCurrentUserDatas();
	let scheduled_stories = currentSettings["scheduled_stories"];

	if(!post.attr("data-fileType")) {
		show_popup(getCurrentUser(), 'invalid media', getCurrentUserAvatarPath(), "choose a photo/video to upload");
		return;
	}

	let id = post.attr("data-id");
	
	let previous_date_ms = post.attr("data-ms");
	let path = post.attr("data-filePath");
	let code = post.attr("data-fileCode") ? post.attr("data-fileCode"): "";
	let hashtag = post.attr("data-fileHashtag");
	let type = post.attr("data-fileType").replace(" ", "");


	let date_iso = post.find(".date").val().trim(); 
	let date = new Date(date_iso);
	let date_ms = date.getTime();

	if(!is_numeric(date_ms)){
		show_popup(getCurrentUser(), 'invalid date', getCurrentUserAvatarPath(), "not a valid Date");
		return post;
	}
	if(!currentSettings){
		show_popup('wiinsta', 'invalid profile', LOGO_PATH, "Select a profile");
		return post;
	}
	
	let post_to_upload = {};
	
	post_to_upload["file"] = {"path": path, "type": type};
	if(code){
		post_to_upload["file"]["code"] = code;
	}
	if(hashtag){
		post_to_upload["file"]["hashtag"] = hashtag;
	}
	if(!scheduled_stories[date_ms]){
		scheduled_stories[date_ms] = [];
	}

	if( (previous_date_ms && previous_date_ms == date_ms) || !previous_date_ms){

		if(id && id != "undefined"){
			scheduled_stories[date_ms][id] = post_to_upload;
		} else {
			scheduled_stories[date_ms].push(post_to_upload);
			post.attr("data-id", scheduled_stories[date_ms].length - 1);
		}
		post.attr("data-ms", date_ms);

	} else if (previous_date_ms && previous_date_ms != date_ms){

		if(id && id != "undefined"){
			scheduled_stories[previous_date_ms].splice(id, 1);
			if(scheduled_stories[previous_date_ms].length == 0){
				delete scheduled_stories[previous_date_ms]
			}
			scheduled_stories[date_ms].push(post_to_upload);
			post.attr("data-id", scheduled_stories[date_ms].length - 1);
		}
		post.attr("data-ms", date_ms);
	}
	

	write_file(currentSettingsPath, JSON.stringify(currentSettings));
	show_popup(getCurrentUser(), 'success', getCurrentUserAvatarPath(), "Story correctly saved");
	return view_post(post);
}

/*
@info: get the profile scheduled stories and populate with them the stories container in the gui
*/
function populate_stories(posts){
	let [currentUser, currentSettings, currentSettingsPath] = getCurrentUserDatas();
	let scheduled_stories = currentSettings["scheduled_stories"];
	let now = new Date();
	let previous_time;
	let times = Object.keys(scheduled_stories).sort((a, b) => {return a - b;});
	let status;
	for (let i=0; i<times.length; i++){ // per ogni data programmata

		let time = times[i]; // prendi la data
		let stories_array = scheduled_stories[time]; // prendi l'array delle storie programmate collegate alla data

		if( time < now ) { // se il tempo in analisi è passato allora non popola i post
			if (times.length == 1 || times[times.length - 1] == time) status = true; // se ci sta solo un tempo nei post programmati allora li mostra per forza
			else {
				if( previous_time ) {
					let stories_to_delete = scheduled_stories[previous_time];
					for (let i = 0; i < stories_to_delete.length; i++) {
						let story = stories_to_delete[i];
						let to_remove = post.file.code ? post.file.code : post.file.path;
						remove_file_from_used_list(null, to_remove);
						clear_stories_container();
					}
					delete scheduled_stories[previous_time];
				}

				previous_time = time;
				if( ! i == times.length - 1 ){ // se sono tutte date passate allora questo if serve per far popolare i post della data piu recente
					continue;
				}
			}

		} else { // se il tempo in analisi non è passato allora popola i suoi post
				 // se è la prima volta che entra popola anche gli ulti post passati presenti
			if(!previous_time || !(previous_time < now)) status = true;
			if( previous_time ) { 
				let stories = scheduled_stories[previous_time];
				for (story_index=0; story_index < stories.length; story_index ++){
					story = stories[story_index];
					create_story(time, story, story_index);
				}
				previous_time = null;
				status = true;
			}
		}

		for (story_index=0; story_index < stories_array.length; story_index ++){
			story = stories_array[story_index];
			create_story(time, story, story_index);
		}

	}
	write_file(currentSettingsPath, JSON.stringify(currentSettings));
}

/*
@date_ms: int ( date in milliseconds)
@obj: object ( post datas )
@id: int (post id)
@info: create in the gui a story with the given datas
@return: jquery object ( the created post )
*/
function create_story(date_ms, obj, id){
	if(!is_valid_profile()) return;
	let story_parent = $(`
<div class="medium-12 column">
  <div class="post" 
  ${ id !== null ? "data-id=" + id : "" }
  ${obj ? (obj.file.path ? "data-filePath=" + obj.file.path : ""): ""}
  ${obj ? (obj.file.type ? "data-fileType=" + obj.file.type : ""): ""}
  ${obj ? (obj.file.code ? "data-fileCode=" + obj.file.code : ""): ""}
  ${obj ? (obj.file.hashtag ? "data-fileHashtag=" + obj.file.hashtag : ""): ""}
  ${ date_ms ? "data-ms=" + date_ms : "" } 
  >
    <div class="post-image-container">
            
      <div class="post-image">
        <div class="icons">
          <div class="icon edit edit-scheduled-icon"></div>
          <div class="icon cancel-icon cancel-edit" style="display: none"></div>
          <div class="icon confirm-icon confirm-edit" style="display: none"></div>
        </div>
        <div class="icon upload upload-icon" style="display: none"></div>
      </div>
    </div>
      
  
    <div class="post-infos">

        <label class="date-label">
          <span data-tooltip aria-haspopup="true" class="has-tip tip-top radius" title="You post Date">
            <strong>Date</strong>
          </span>
          <input type="datetime-local" value="${date_ms ? ms_to_iso(date_ms): ""}" class="date" name="" disabled>
        </label>
        
    </div>
    <div class="post-icons">
      <div class="icon delete delete-icon big"></div>
    </div>
  </div>
</div>`);
	let story = story_parent.children(".post");
	obj ? (obj.file ? add_file_to_post(story, obj.file.path, obj.file.type): null): null;
	$(".lista-stories").append(story);
	return story;
}

function clear_stories_container(){
	$(".lista-stories").empty();
}