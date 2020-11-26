window.addEventListener("load", start);

function start(){
	var delete_button_active = null;
	let post;
	$('#random-posts-date').val(ms_to_iso(Date.now()));
	// MODIFICA L'ICONA E ABILITA IL LINK QUANDO SI VUOLE ELIMINARE UNA DOMANDA
	$("body").click( evt => {
		
		if(is_page("posts")){
			let target = $(evt.target); // elemento cliccato
			// PER LE ALTRE AZIONI VEDI stories.js
			if(delete_button_active && target[0] != delete_button_active[0]){
				delete_button_active.removeClass("remove-alert");
				delete_button_active.removeClass("delete-post-icon");
				delete_button_active.removeClass("delete-post");
				// rimette il bottone attivo a null
				delete_button_active = null;
			}

			// se il target del clicc e' un icona delete ci aggiunge la classe alert
			if (target.is(".icon.delete") && !target.hasClass("remove-alert")){
				delete_button_active = target;
				target.addClass("remove-alert");
				target.addClass("delete-post-icon");
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
				post = save_post(post); // mette la variabile post = null se il save è effettuato correttamente
			}

			if(target.is(".icon.delete-post")){
				post = target.closest(".post");
				if(!post) return;
				post = delete_post(post, getCurrentSettings()["scheduled_posts"]); // mette la variabile post = null se il save è effettuato correttamente
			}
		}

	});

	$(".add-post").click( evt => {
		create_post();
	});

	$(".random-posts").click( evt => {
		if(!is_valid_profile()) return;
		let caption_type = $('input[name="caption"]:checked').val();

		let num = $("#random-posts-count").val();
		if(!num || num == 0){
			show_popup(getCurrentUser(), 'missing setting', getCurrentUserAvatarPath(), "write the number of posts to generate");
			return;
		}
		let start_date = $("#random-posts-date").val();
		let start_date_iso = new Date(start_date);
		let start_date_ms = start_date_iso.getTime();
		if(!is_numeric(start_date_ms)){
			show_popup(getCurrentUser(), 'invalid date', getCurrentUserAvatarPath(), "select a valid date for start the generation of the posts");
			return;
		}
		if(!getCurrentSettings()["random_post_delay"]){
			show_popup(getCurrentUser(), 'missing setting', getCurrentUserAvatarPath(), "The selected profile has the field 'RANDOM POST DELAY' empty, this block the random generation, please insert a valid value.");
			return;
		}
		let num_days = $('#random-posts-days').val();
		let day_increase = 1000 * 60 * 60 * 24;
		let [profile, currentSettings, currentSettingsPath] = getCurrentUserDatas();
		let increase_ms = currentSettings["random_post_delay"] * 60 * 1000;

		for(let day = 0; day < num_days; day ++){
			for (let i=0; i < num; i++){
				
				let hashtags_ = currentSettings["hashtags"];	
				let [code, upload, type, owner, caption, random_hashtag] = get_posts_random_file(profile, hashtags_);
				console.log("caption: ", caption);
				if(!upload) {
					show_popup(getCurrentUser(), 'empty medias', getCurrentUserAvatarPath(), "alreasy used all the medias relative to its hashtags");
					return;
				};
				if(caption_type == 'random'){
					caption = random_caption(currentSettings["captions"]);
				} if(caption_type == 'append'){
					caption += random_caption(currentSettings["captions"]);
				}
				
				if(!caption){
					show_popup(getCurrentUser(), 'invalid caption', getCurrentUserAvatarPath(), "could not found a valid caption, if you are using the 'random caption'  option fill the  'captions' field");
					return;
				}
				let post_obj = {
					"caption": caption,
					"file":{"source":"url","path": upload, "code": code, "type": type, "hashtag": random_hashtag},
					"tags":[owner]
				};

				let increasedHours = increase_ms * i;
				let increasedDays = day * day_increase;
				let current_post_date = start_date_ms + increasedHours + increasedDays;
				console.log("POST: ", upload);
				console.log(post_obj);
				post = create_post(current_post_date , post_obj);
				save_post(post);
			}
		}
	});

	$('.selectem-value').change( evt => {
		let type = $("select.type").val().trim();
		if (!is_page("posts")) return;
		if(getCurrentUser() == "default"){
			show_popup('wiinsta', 'invalid profile', LOGO_PATH, "select a profile");
		} else {
			clear_posts_container();
			populate_posts();
		}
	});

	$(".delete-posts").click( evt => {
		if(!is_valid_profile()) return;
		getCurrentSettings()["scheduled_posts"] = {};
		write_file(getCurrentObject()["profile_fl"], JSON.stringify(getCurrentSettings()));
		clear_posts_container();
		populate_posts();
		show_popup('wiinsta', 'success', LOGO_PATH, "All posts were correctly deleted");
	});

}

/*
@post: jquery object
@info: add the created post ot the scheduled object and save it to the file
*/
function save_post(post){
	if(is_running()){
		show_popup('wiinsta', 'busy profile', LOGO_PATH, "The selected profile is currently running, stop it for create new scheduled medias.");
		return;
	}
	console.log("saving")
	let [currentUser, currentSettings, currentSettingsPath] = getCurrentUserDatas();
	let captions_to_use = currentSettings["captions_to_use"];
	let scheduled_posts = currentSettings["scheduled_posts"];
	if(!post.attr("data-filePath")) {
		show_popup(getCurrentUser(), 'invalid media', getCurrentUserAvatarPath(), "choose a photo/video to upload");
		return post;
	}

	let id = post.attr("data-id"); // this returns "undefined" as string
	let caption = post.find(".caption").val().trim();
	let previous_date_ms = post.attr("data-ms");
	let path = post.attr("data-filePath");
	let code = post.attr("data-fileCode") ? post.attr("data-fileCode"): "";
	let hashtag = post.attr("data-fileHashtag") ? post.attr("data-fileHashtag"): "";
	let type = post.attr("data-fileType").replace(" ", "");

	let tags = post.find(".tags").val().replace(" ", "").split("&").removeAll("");
	let date_iso = post.find(".date").val().trim(); 
	let date = new Date(date_iso);
	let date_ms = date.getTime();
	if(caption == "") {
		show_popup(getCurrentUser(), 'invalid caption', getCurrentUserAvatarPath(), "not a valid caption");
		return post;
	}
	if(!is_numeric(date_ms)){
		show_popup(getCurrentUser(), 'invalid date', getCurrentUserAvatarPath(), "not a valid Date");
		return post;
	}
	if(!currentSettings){
		show_popup('wiinsta', 'invalid profile', LOGO_PATH, "Select a profile");
		return post;
	}

	let caption_index;
	if(!captions_to_use.includes(caption)){
		captions_to_use.push(caption);
		caption_index = captions_to_use.length - 1;
	} else {
		caption_index = captions_to_use.indexOf(caption);
	}
	let post_to_upload = {};
	
	post_to_upload["caption"] = caption_index;
	post_to_upload["file"] = {"path": path, "type": type};
	if(code){
		post_to_upload["file"]["code"] = code;
	}
	if(hashtag){
		post_to_upload["file"]["hashtag"] = hashtag;
	}
	post_to_upload["tags"] = tags;
	if(!scheduled_posts[date_ms]){
		scheduled_posts[date_ms] = [];
	}

	if( (previous_date_ms && previous_date_ms == date_ms) || !previous_date_ms){

		if(id && id != "undefined"){
			console.log("ID: ", id, id.constructor);
			scheduled_posts[date_ms][id] = post_to_upload;
		} else {
			scheduled_posts[date_ms].push(post_to_upload);
			post.attr("data-id", scheduled_posts[date_ms].length - 1);
		}
		post.attr("data-ms", date_ms);

	} else if (previous_date_ms && previous_date_ms != date_ms){

		if(id && id != "undefined"){
			console.log("ID: ", id);
			scheduled_posts[previous_date_ms].splice(id, 1);
			if(scheduled_posts[previous_date_ms].length == 0){
				delete scheduled_posts[previous_date_ms]
			}
			scheduled_posts[date_ms].push(post_to_upload);
			post.attr("data-id", scheduled_posts[date_ms].length - 1);
		}
		post.attr("data-ms", date_ms);

	}
	console.log(scheduled_posts)
	write_file(currentSettingsPath, JSON.stringify(currentSettings));
	show_popup(getCurrentUser(), 'success', getCurrentUserAvatarPath(), "Post correctly saved");
	return view_post(post);
}

/*
@date_ms: int ( date in milliseconds)
@obj: object ( post datas )
@id: int (post id)
@info: create in the gui a post with the given datas
@return: jquery object ( the created post )
*/
function create_post(date_ms, obj, id){
	if(!is_valid_profile()) return;
	console.log(obj)
	let post_parent = $(`
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
        <label class="caption-label">
          <span data-tooltip aria-haspopup="true" class="has-tip tip-top radius" title="You post caption">
            <strong>Caption</strong>
          </span>

          <textarea class="caption" disabled>${
          	obj ? ( (obj.caption !== null || obj.caption !== undefined) ? (is_numeric(obj.caption) ? getCurrentSettings()["captions_to_use"][obj.caption] : obj.caption): ""): ""
          }</textarea>

        </label>
        <label class="date-label">
          <span data-tooltip aria-haspopup="true" class="has-tip tip-top radius" title="You post Date">
            <strong>Date</strong>
          </span>
          <input type="datetime-local" value="${date_ms ? ms_to_iso(date_ms): ""}" class="date" name="" disabled>
        </label>
        <label class="tags-label">
          <span data-tooltip aria-haspopup="true" class="has-tip tip-top radius" 
          title="You post Tags, write each username separated byt '&'. Ex: user1 & user2 & user4">
            <strong>Tags</strong>
          </span>
          <input type="text" class="tags" name="" value="${obj ? (obj.tags ? obj.tags.join("&"): ""): ""}" disabled>
        </label>
        
    </div>
    <div class="post-icons">
      <div class="icon delete delete-icon big"></div>
    </div>
  </div>
</div>`);
	console.log(post_parent);
	let post = post_parent.children(".post");
	obj ? (obj.file ? add_file_to_post(post, obj.file.path, obj.file.type): null): null;
	$(".lista-posts").append(post);

	return post;
}

/*
@info: get the profile scheduled posts and populate with them the posts container in the gui
*/
function populate_posts(){
	console.log("starting")
	let [currentUser, currentSettings, currentSettingsPath] = getCurrentUserDatas();
	let captions_to_use = currentSettings["captions_to_use"];
	let scheduled_posts = currentSettings["scheduled_posts"];
	let now = new Date();
	let in_use_captions_index = [];
	let removed_captions_index = [];
	let previous_time;
	let times = Object.keys(scheduled_posts).sort((a, b) => {return a - b;});
	let status;
	for (let i=0; i<times.length; i++){

		let time = times[i];
		let posts_array = scheduled_posts[time];
		if( time < now ) { // se il tempo in analisi è passato allora non popola i post
			if (times.length == 1 || times[times.length - 1] == time) status = true; // se ci sta solo un tempo nei post programmati allora li mostra per forza
			else {
				if( previous_time ){
					let posts_to_delete = scheduled_posts[previous_time];
					for (let i = 0; i < posts_to_delete.length; i++) {
						let post = posts_to_delete[i];
						console.log(post);
						let to_remove = post.file.code ? post.file.code : post.file.path;
						console.log(to_remove);
						remove_file_from_used_list(null, to_remove);
						clear_posts_container();
					}
					delete scheduled_posts[previous_time];
				}

				status = false;
				previous_time = time;
				if( ! i == times.length - 1 ){ // se sono tutte date passate allora questo if serve per far popolare i post della data piu recente
					continue;
				}
			}

		} else { // se il tempo in analisi non è passato allora popola i suoi post
				 // se è la prima volta che entra popola anche gli ulti post passati presenti
			console.log("populating posts of future time", time);
			if(!previous_time || !(previous_time < now)) status = true;
			if( previous_time ) { 
				let posts = scheduled_posts[previous_time];
				for (post_index=0; post_index < posts.length; post_index ++){
					post = posts[post_index];
					let caption_index = post["caption"];
					if(!in_use_captions_index.includes(caption_index)) in_use_captions_index.push(caption_index);
					create_post(time, post, post_index);
				}
				previous_time = false;
				status = true;
			}

		}
		
		for (post_index=0; post_index < posts_array.length; post_index ++){
			post = posts_array[post_index];
			console.log(time, post, post_index, status)
			let caption_index = post["caption"];
			if(!status){
				if(!removed_captions_index.includes(caption_index)){
					removed_captions_index.push(caption_index)
				}
			} else {
				if(!in_use_captions_index.includes(caption_index)){
					in_use_captions_index.push(caption_index)
				}
				create_post(time, post, post_index);
			}
		}

	}

	for ( let i=0; i < captions_to_use.length; i ++){
		if( in_use_captions_index.includes(i) ) continue;
		captions_to_use.splice(i, 1);
	}
	
	write_file(currentSettingsPath, JSON.stringify(currentSettings));
}