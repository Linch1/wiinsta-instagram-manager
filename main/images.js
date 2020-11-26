window.addEventListener('load', start);
function start(){
	

	$("body").click( async evt => {
		let target = $(evt.target);

		if (target.hasClass('delete-image')){
			let url = target.data('url');
			let hashtag = target.data('hashtag');
			let type = target.data('type');
			let local = target.is("[data-local]");
			target.closest(".column").remove();
			
			if(local){
				if(exists_file(url)){
					remove_file(url);
					show_popup(getCurrentUser(), 'success', getCurrentUserAvatarPath(), "element succesfully deleted");
				}
				return;
			}

			let path = DOWNLOAD_FOLDER + hashtag + ".txt";
			let new_path = NEW_DOWNLOAD_FOLDER + hashtag + ".txt";
			let collection = JSON.parse(read_file(path));
			let new_collection;
			if(exists_file(new_path)){
				new_collection = JSON.parse(read_file(new_path));
				if(new_collection[type][url]) delete new_collection[type][url];
				write_file(new_path, JSON.stringify(new_collection));
			}
			delete collection[type][url];
			collection['count'] --;
			write_file(path, JSON.stringify(collection));
			show_popup(getCurrentUser(), 'success', getCurrentUserAvatarPath(), "element succesfully deleted");

		}

		if (target.hasClass('restore-image')){
			show_popup(getCurrentUser(), 'restoring', getCurrentUserAvatarPath(), "restoring selected media");
			let url = target.data('url');
			let hashtag = target.data('hashtag');
			let type = target.data('type');
			let code = target.data('code');
			let media = await restoreMedia(code, url, type, hashtag);

			if(!media) show_popup(getCurrentUser(), 'restore fail', getCurrentUserAvatarPath(), "element could not be restored");
			else if ( media == "apiNotLogged") show_popup(getCurrentUser(), 'api login', getCurrentUserAvatarPath(), "Profile instagram api is not logged, for login go to profiles -> click the login api action in the actions bar");
			else show_popup(getCurrentUser(), 'success', getCurrentUserAvatarPath(), "element succesfully restored");
		
			populate_images(type, getCurrentSettings());
			

		}
	});

	$('#run-collector').click( evt => {
		if (!is_valid_profile()) return;
		collect_images(getCurrentUser());
	});

	$('#run-collector-all').click( evt => {
		let profiles = getAllProfiles();
		for (let i=0; i<profiles.length; i++){
			let profile = profiles[i];
			collect_images(profile);
		}
	});

	$('.selectem-value').change( evt => {
		let type = $("select.type").val().trim();
		if (!is_page("images")) return;
		if(getCurrentUser() == "default"){
			populate_images(type);
		} else {
			console.log("populating ")
			populate_images(type, getCurrentSettings());
		}
	});

	$('.delete-images').click( evt => {

		if (getCurrentUser() == "default") {
			clear_saved_images();  // remove images from files
		} else {
			clear_saved_images(getCurrentSettings()["hashtags"]);  // remove images from files
		}
		delete_images();  // remove rendered images
	});

	$('.type').change( evt => {
		let type = $(evt.currentTarget).val().trim();
		if (!is_page("images")) return;
		if(getCurrentUser() == "default"){
			populate_images(type);
		} else {
			populate_images(type, getCurrentSettings());
		}
	});
}



/*
@type: string [all, latest]
@hashtags: array
@info: get all the link medias previously collected of the given hashtags and the ones locally passed
@return: object {"image": [[...], [...] ...], "video": [[...], [...] ...]}
*/
function get_contents(type, hashtags){
	let parent_path;
	if(type == "latest"){
		parent_path = NEW_DOWNLOAD_FOLDER;
	} else {
		parent_path = DOWNLOAD_FOLDER;
	}
	let hashtags_copy = [];
	if(!exists_file(parent_path)) return null;

	let files;

	if(!hashtags){
		files = get_files(parent_path);
	} else {
		for (let i = 0; i < hashtags.length; i++) {
			let hashtag = hashtags[i];
			console.log(hashtag)
			if(hashtag.startsWith('!')){
				hashtags_copy.push(hashtag);
				continue;
			}
			hashtags_copy.push(hashtag + ".txt");
		}
		files = hashtags_copy;
	}

	let contents = {"image": [], "video": []};
	for (let i = 0; i < files.length; i++) {

		if(files[i].startsWith('!')){
			
			let localPath = files[i].substring(1);
			let medias = get_files(localPath);
			for (let j = 0; j < medias.length; j++) {
				let media = medias[j];
				
				if(is_image(media)){
					contents["image"].push({
						'url': `${localPath}/${media}`,
						'owner': "local",
						'file': '!' + localPath
					});
				} else if(is_video(media)){
					contents["video"].push({
						'url': `${localPath}/${media}`,
						'owner': "local",
						'file': '!' + localPath
					});
				}
			}
			continue;
		}

		let file = files[i];
		let path = parent_path + file;
		if (!exists_file(path)) continue;
		
		let file_links = JSON.parse(read_file(path));
		for ([code, value] of Object.entries(file_links["image"])) {
			contents["image"].push({
				'code': code,
				'url': value["url"],
				'owner': value["owner"],
				'file': file
			});
		}
		for ([code, value] of Object.entries(file_links["video"])) {
			contents["video"].push({
				'code': code,
				'url': value["url"],
				'owner': value["owner"],
				'file': file
			});
		}
	}
	if(contents["image"].length == 0 && contents["video"].length == 0){
		show_popup(getCurrentUser(), 'empty medias', getCurrentUserAvatarPath(), "no images found");
		return;
	}
	return contents;
}

/*
@info: clear the files of the given hashtags
*/
function clear_saved_images(hashtags){
	let parent_path = DOWNLOAD_FOLDER;
	let parent_new_path = NEW_DOWNLOAD_FOLDER;
	if(!exists_file(parent_path)) return null;
	let files = [];
	if(!hashtags){
		files = get_files(parent_path);
	} else {
		for (let i = 0; i < hashtags.length; i++) {
			files.push(hashtags[i] + ".txt");
		}
	}
	// pulisce tutti i file degli hashtags
	for (let i = 0; i < files.length; i++) {
		let file = files[i];
		write_file(parent_path + file, IMAGES_FL_DEFAULT_CONTENT);
		write_file(parent_new_path + file, IMAGES_FL_DEFAULT_CONTENT);
	}
	// pulisce tutti i file dei media usati
	let used_files;
	if(!hashtags){
		used_files = get_files(USED_FILES_FOLDER);
		for (let i = 0; i < used_files.length; i++) {
			let file = files[i];
			write_file(USED_FILES_FOLDER + file, USED_FL_DEFAULT_CONTENT);
		}
	} else {
		write_file(getCurrentUsedFilePath(), USED_FL_DEFAULT_CONTENT);
	}
	show_popup(getCurrentUser(), 'success', getCurrentUserAvatarPath(), "images deleted");
}

/*
@type: string [all, latest]
@settings: obj [the current profile settings, if not given it will populate with all the links of all hashtags]
@info: populate the collected links in the gui
*/
function populate_images(type, settings){
	delete_images();
	let contents;
	if(settings){
		contents = get_contents(type, settings["hashtags"]);
	} else {
		contents = get_contents(type);
	}
	let top = `
		<div class='medium-6 column'>
					<div class="container">
						<div class="content">
		`
	let bottom = `
				</div>
			</div>
		</div>
	`

	if(!contents) return;
	let container = $("#contents");

	for (let i = 0; i < contents["image"].length; i++) {
		let image_obj = contents["image"][i];
		let code = image_obj['code'];
		let link = image_obj['url'];
		let owner = image_obj['owner'];
		let hashtag = image_obj['file'].substring(0, image_obj['file'].length - 4);
		
		
		let localFile = owner == 'local';
		let img = 
		$(`
			${top}
				<a href="${link}" data-rel="lightcase:myCollection"
				 title="OWNER: ${owner}" 
				 class="showcase">

					<img src="${link}" />
				</a>
			</div>
				<div class="controls">
					<div class="hashtag"> ${hashtag} </div>
					<div class="icons">
						<div class="delete-image cover-image icon delete-icon" ${localFile ? 'data-local' : ''} data-hashtag="${hashtag}" data-type="image" data-url="${localFile ? link : code}"></div>
						<div class="restore-image cover-image icon restore-icon" data-code="${code}" data-hashtag="${hashtag}" data-type="image" data-url="${link}"></div>
					</div>
			${bottom}				
		`);
		container.append(img);
	}

	for (let i = 0; i < contents["video"].length; i++) {
		let video_obj = contents["video"][i];

		let code = video_obj['code'];
		let link = video_obj['url'];
		let owner = video_obj['owner'];
		let hashtag = video_obj['file'].substring(0, video_obj['file'].length - 4);
		let localFile = owner == 'local';

		let video =  
		$(`
			${top}
				<a href="${link}" data-rel="lightcase:myCollection"
				 title="OWNER: ${owner}" 
				 class="showcase">
					<video src="${link}" controls>
				</a>
			</div>
				<div class="controls">
					<div class="hashtag"> ${hashtag} </div>
					<div class="icons">
						<div class="delete-image cover-image icon delete-icon" ${localFile ? 'data-local' : ''} data-hashtag="${hashtag}" data-type="video" data-url="${link}"></div>
						<div class="restore-image cover-image icon restore-icon" data-code="${code}" data-hashtag="${hashtag}" data-type="video" data-url="${link}"></div>
					</div>
			${bottom}
			
		`);
		container.append(video);
	}

	$('a[data-rel^=lightcase]').lightcase();
}

/*
@info: clear the previously populated parent
*/
function delete_images(){
	let contents = $("#contents");
	$("#contents").empty();
}
