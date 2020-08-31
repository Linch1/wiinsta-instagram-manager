/*
OTHER FILES THAT MANAGES IMAGES

- images.js
- run.js
- posts.js
- stories.js

*/


/*







MANAGE DOWNLOADED MEDIAS.

- DOWNLOAD 
- RESTORATION








*/


/*
@info: collect the images for the selected profile
*/
function collect_images(profile){
    let settings = getProfileSettings(profile);
    let hashtags = settings['hashtags'];
    let bot = getProfileBot(profile);

    if(bot) images_collector(profile, hashtags);
    else{
        let bot = new instabot(profile);
        setProfileBot(profile, bot);
        (async () => {
            await bot.ig_api_login();
            images_collector(profile, hashtags);
        })();
        show_popup(profile, 'processing', getUserAvatarPath(profile), "The image collector will start soon");
    }
    
}
/*
@info: start the media collector task
@profile: the profile name
@sources: the list that contains the hashtags/profiles
*/
async function images_collector(profile, sources) {
    show_popup(profile, 'working', getUserAvatarPath(profile), "collecting images");
    let hashtags = [];
    let users = [];
    let tiktok = [];
    for (let i = 0; i < sources.length; i++) {
        let elem = sources[i];
        if (elem.startsWith('@')) users.push(elem);
        else if (elem.startsWith('%')) tiktok.push(elem);
        else if (elem.startsWith('#')) hashtags.push(elem);
    }
    await collect_user_posts(profile, users);
    await collect_hashtags(profile, hashtags);

    if(getProfileBot(profile).is_open()) show_popup(profile, 'success', getUserAvatarPath(profile), "images collected");
}
/*
@users: array of strings
@info: collect the medias of the given profiles though requests and save the links
*/
async function collect_user_posts(profile, users) {
    let bot = getProfileBot(profile);
    for (let i = 0; i < users.length; i++) {
        if(!bot.is_open()) return;
        let username = users[i].trim().substring(1);
        let username_file = bot.DOWNLOAD_FOLDER + users[i] + '.txt'; // users[i] è  con @iniziale, username è senza @
        let username_file_new = bot.DOWNLOAD_NEW_FOLDER + users[i] + '.txt';
        create_file(username_file, IMAGES_FL_DEFAULT_CONTENT);
        create_file(username_file_new, IMAGES_FL_DEFAULT_CONTENT);
        let username_collections = JSON.parse(read_file(username_file));
        let username_collections_new = JSON.parse(IMAGES_FL_DEFAULT_CONTENT);
        let medias = { 'images': {}, 'videos': {} };
        let user_datas;

        // serve a prendere l'id dell'user
        try {
            user_datas = await rp(`https://www.instagram.com/${username}/?__a=1`)
                .catch(e => {
                    bot.add_log('error', 'ERROR in collecting user feed ' + username + ': ' + e);
                    return null;
                });
            if (!user_datas) continue;
            user_datas = JSON.parse(user_datas);
        } catch (e) {
            console.log(e);
        }

        let user_id = user_datas['graphql']['user']['id'];

        // preso l'id l'api colleziona i media
        let feed = bot.ig.feed.user(user_id);

        let items = await feed.items()
            .catch(e => {
                bot.add_log('error', 'ERROR in collecting user feed ' + username);
                console.log(e);
            });
        for (let j = 0; j < items.length; j++) {
            let item = items[j];
            let caption = item['caption'] ? item['caption']['text'] : '';

            if (item['video_versions']) {
                let url = item['video_versions'][0]['url'];
                let code =  item['code'];
                medias['videos'][code] = { 'owner': username, 'caption': caption, 'id': item['id'], 'url': url };

            } else if (item['carousel_media']) {
                let carousel = item['carousel_media'];
                let code = item['code'];
                for (let c = 0; c < carousel.length; c++) {
                    let carousel_media = carousel[c];
                    if (carousel_media['video_versions']) {
                        let carousel_child_media = carousel_media['video_versions'][0]['url'];
                        medias['videos'][code + '?' + c] = {
                            'owner': username,
                            'caption': caption,
                            'id': item['id'],
                            'url': carousel_child_media,
                            'position': c,
                            'carousel': true
                        };
                    } else if (carousel_media['image_versions2']) {
                        let carousel_child_media = carousel_media['image_versions2']['candidates'][0]['url'];
                        medias['images'][code + '?' + c] = {
                            'owner': username,
                            'caption': caption,
                            'id': item['id'],
                            'url': carousel_child_media,
                            'position': c,
                            'carousel': true
                        };
                    }
                }
            } else if (item['image_versions2']) {
                let url = item['image_versions2']['candidates'][0]['url'];
                let code = item['code'];
                medias['images'][code] = { 'owner': username, 'caption': caption, 'id': item['id'], 'url': url };
            } else {
                console.log('\n\nNEW THING FOUND' + item);
            }
        }

        write_collected_medias(username_file, username_file_new, username_collections, username_collections_new, medias['images'], medias['videos'])
    }
}
/*
@hashtags: array of strings
@info: collect the medias of the given hashtags though requests and save the links
*/
async function collect_hashtags(profile, hashtags) {
    let bot = getProfileBot(profile);
    let links = [];
    for (let i = 0; i < hashtags.length; i++) {
        if(!bot.is_open()) return;
        let hashtag_ = hashtags[i].trim();
        let hashtag = hashtag_.substring(1);
        let hashtag_file = bot.DOWNLOAD_FOLDER + hashtag_ + '.txt';
        let hashtag_file_new = bot.DOWNLOAD_NEW_FOLDER + hashtag_ + '.txt';
        create_file(hashtag_file, IMAGES_FL_DEFAULT_CONTENT);
        create_file(hashtag_file_new, IMAGES_FL_DEFAULT_CONTENT);
        let hashtag_collections = JSON.parse(read_file(hashtag_file));
        let hashtag_collections_new = JSON.parse(IMAGES_FL_DEFAULT_CONTENT);

        let medias = { 'images': {}, 'videos': {} };
        let hastag_feed = await rp(`https://www.instagram.com/explore/tags/${hashtag}/?__a=1`)
            .catch(e => {
                bot.add_log('error', 'ERROR in collecting hashtag feed ' + hashtag + ': ' + e);
                return null;
            });
        if (!hastag_feed) continue;
        try {
            hastag_feed = JSON.parse(hastag_feed);
        } catch (e) {
            bot.add_log('error', 'Error when collecting medias from hashtag <' + hashtag + '>. Check if it exists.');
            continue;
        }
        let top_posts = hastag_feed['graphql']['hashtag']['edge_hashtag_to_top_posts']['edges'];
        for (let [index, node] of Object.entries(top_posts)) {
            node = node['node'];
            let type = node['__typename'].toLowerCase();
            let short_code = node['shortcode'];
            let id = node['id'];
            let caption = node['edge_media_to_caption']['edges'][0] ? node['edge_media_to_caption']['edges'][0]['node']['text'] : '';

            if (type.includes('image')) {
                let image_contents = await requestMediaContents(short_code)
                    .catch(e => {
                        bot.add_log('error', 'ERROR in collecting image feed ' + e);
                        return null;
                    });
                if (!image_contents) continue;
                let [media, owner] = parseMediaImage(image_contents);
                if (links.includes(short_code)) continue;
                links.push(short_code);
                medias['images'][short_code] = { 'owner': owner, 'caption': caption, 'id': id, 'url': media };
            } else if (type.includes('video')) {
                let video_contents = await requestMediaContents(short_code)
                    .catch(e => {
                        bot.add_log('error', 'ERROR in collecting video feed' + e);
                        return null;
                    });
                if (!video_contents) continue;
                let [media, owner] = parseMediaVideo(video_contents);
                if (links.includes(short_code)) continue;
                links.push(short_code);
                medias['videos'][short_code] = { 'owner': owner, 'caption': caption, 'id': id, 'url': media };
            } else if (type.includes('sidecar')) {
                let carousel_contents = await requestMediaContents(short_code)
                    .catch(e => {
                        bot.add_log('error', 'ERROR in collecting carousel feed' + e);
                        return null;
                    });
                if (!carousel_contents) continue;
                let [carouselMedias, owner] = parseMediaCarousel(carousel_contents);
                let extractedCarouselMedias = extractCarouselMedias(carouselMedias);
                // console.log(extractedCarouselMedias);
                for (let i = 0; i < extractedCarouselMedias.length; i++) {
                    let current = extractedCarouselMedias[i];
                    // console.log(current);
                    if (links.includes(current.media)) continue;
                    links.push(current.media);
                    medias[current.type][short_code + '?' + i] = {
                        'owner': current.owner,
                        'caption': caption,
                        'id': id,
                        'url': current.media,
                        'position': current.position,
                        'carousel': true
                    };

                }
            }
        }

        write_collected_medias(hashtag_file, hashtag_file_new, hashtag_collections, hashtag_collections_new, medias['images'], medias['videos']);

    }
}
/*
@info: save the collected medias
*/
function write_collected_medias(file, file_new, collection, collection_new, images, videos) {

    for (let [code, media_infos] of Object.entries(images)) {
        if (collection["image"][code]) continue;
        collection["count"] += 1;
        collection["image"][code] = {
            "owner": media_infos['owner'],
            "caption": media_infos['caption'],
            "id": media_infos['id'],
            "url": media_infos['url']
        };
        collection_new["image"][code] = {
            "owner": media_infos['owner'],
            "caption": media_infos['caption'],
            "id": media_infos['id'],
            "url": media_infos['url']
        };
        if (media_infos.carousel) {
            collection["image"][code]['carousel'] = media_infos['carousel'];
            collection["image"][code]['position'] = media_infos['position'];
            collection_new["image"][code]['carousel'] = media_infos['carousel'];
            collection_new["image"][code]['position'] = media_infos['position'];
        }
    }

    for (let [code, media_infos] of Object.entries(videos)) {
        if (collection["video"][code]) continue;
        collection["count"] += 1;
        collection["video"][code] = {
            "owner": media_infos['owner'],
            "caption": media_infos['caption'],
            "id": media_infos['id'],
            "url": media_infos['url']
        };
        collection_new["video"][code] = {
            "owner": media_infos['owner'],
            "caption": media_infos['caption'],
            "id": media_infos['id'],
            "url": media_infos['url']
        };
        if (media_infos.carousel) {
            collection["video"][code]['carousel'] = media_infos['carousel'];
            collection["video"][code]['position'] = media_infos['position'];
            collection_new["video"][code]['carousel'] = media_infos['carousel'];
            collection_new["video"][code]['position'] = media_infos['position'];
        }
    }

    write_file(file, JSON.stringify(collection));
    write_file(file_new, JSON.stringify(collection_new));


}

/*
@type: string [ code of the previoudly collectyed media ]
@info: does a https request to the json file of the media file
@return: obj [the json body of the media's datas]
*/
async function requestMediaContents(code){  
    return rp(`https://www.instagram.com/p/${code}/?__a=1`);
}
/*
@image_contents: obj [ the json body from the request ]
@return: [media link, media owner]
*/
function parseMediaImage(image_contents){
    let image_datas = JSON.parse(image_contents)['graphql']['shortcode_media'];
    return getMediaImage(image_datas);
}
/*
@video_contents: obj [ the json body from the request ]
@return: [media link, media owner]
*/
function parseMediaVideo(video_contents){
    let video_datas = JSON.parse(video_contents)['graphql']['shortcode_media'];
    console.log(video_datas);
    return getMediaVideo(video_datas);
}
/*
@carousel_contents: obj [ the json body from the request ]
@return: [medias links, medias owner]
*/
function parseMediaCarousel(carousel_contents){
    let carousel_datas = JSON.parse(carousel_contents)['graphql']['shortcode_media'];
    console.log(carousel_datas);
    let owner = carousel_datas['owner']['username'];
    let medias =  carousel_datas["edge_sidecar_to_children"]["edges"]
    return [medias, owner];
}
/*
@image_datas: obj
@return: [media link, media owner]
*/
function getMediaImage(image_datas){
    let media = image_datas['display_url']; 
    let owner = image_datas['owner']['username'];
    return [media, owner];
}
/*
@video_datas: obj
@return: [media link, media owner]
*/
function getMediaVideo(video_datas){
    let media = video_datas['video_url'];
    let owner = video_datas['owner']['username'];
    return [media, owner];
}
/*
@carouselMedias: obj
@return: array of array [extracted medias]
*/
function extractCarouselMedias(carouselMedias){
    let medias = [];
    for ([position, object] of Object.entries(carouselMedias)){
        object = object["node"];
        let newMedia = {};
        newMedia.position = position;
        if(object["__typename"].toLowerCase().includes("image")){
            newMedia.type = "images";
            newMedia.media = object['display_url']; 
        } else if(object["__typename"].toLowerCase().includes("video")){
            newMedia.type = "videos";
            newMedia.media = object['video_url']; 
        }
        medias.push(newMedia);
    }
    return medias;
}
/*
@uri: string ( the link of the media to restore )
@type: string ( image/video )
@hashtag: string ( the hashtag of the link to restore )
@info: restore a selected media
*/
async function restoreHashtagMedia(code, uri, type, hashtag){
    let hashtag_file = DOWNLOAD_FOLDER + hashtag + '.txt';
    let hashtag_file_new = NEW_DOWNLOAD_FOLDER  + hashtag + '.txt';
    let hashtag_collections = JSON.parse(read_file(hashtag_file));
    let hashtag_collections_new = JSON.parse(read_file(hashtag_file_new));

    let currentFile = hashtag_collections[type][code];
    let newMedia = null;
    let updateNew = false;

    if( hashtag_collections_new[type][code] ) updateNew = true;

    if( currentFile.carousel ){
        let [code_normal, position] = code.split('?');
        if(isNaN(position)) return null;
        let carousel_contents =  await requestMediaContents(code_normal)
        .catch( e => {
            return null;
        });
        if(!carousel_contents) return null;
        let [carouselMedias, owner] = parseMediaCarousel(carousel_contents);
        let extractedCarouselMedias = extractCarouselMedias(carouselMedias);
        let newFile = extractedCarouselMedias[position];
        newMedia = newFile.media;

    } else if(type == 'image'){
        let image_contents = await requestMediaContents(code)
        .catch( e => {
            return null;
        });
        if(!image_contents) return null;
        let [media, owner] = parseMediaImage(image_contents);
        newMedia = media;
    } else if(type == 'video'){
        let video_contents = await requestMediaContents(code)
        .catch( e => {
            return null;
        });
        if(!video_contents) return null;
    
        let [media, owner] = parseMediaVideo(video_contents);
        newMedia = media;
    }
    if(!newMedia){
        console.log("Failing restoration on media: " + uri + ", it is now deleted ( maybe was removed from the owner ) ");
        return;
    }
    if(currentFile.carousel){
        hashtag_collections[type][code] = {
            'owner': currentFile.owner,
            'caption': currentFile.caption, 
            'id': currentFile.id,
            'url': newMedia,
            'position': currentFile.position,
            'carousel': true
        }
        if(updateNew ){
            hashtag_collections_new[type][code] = {
                'owner': currentFile.owner,
                'caption': currentFile.caption, 
                'id': currentFile.id, 
                'url': newMedia,
                'position': currentFile.position,
                'carousel': true
            };
        }
    } else {
        hashtag_collections[type][code] = {
            'owner': currentFile.owner,
            'caption': currentFile.caption, 
            'id': currentFile.id, 
            'url': newMedia
        }
        if(updateNew ){
            hashtag_collections_new[type][code] = {
                'owner': currentFile.owner,
                'caption': currentFile.caption, 
                'id': currentFile.id, 
                'url': newMedia
            };
        }
    }

    write_file(hashtag_file, JSON.stringify(hashtag_collections));
    write_file(hashtag_file_new, JSON.stringify(hashtag_collections_new));
    return newMedia;
}

/*
@uri: string ( the link of the media to restore )
@type: string ( image/video )
@profile: string ( the profile of the link to restore )
@info: restore a selected media
*/
async function restoreProfileMedia(code, uri, type, profile){
    let username = profile.trim().substring(1);
    let username_file = DOWNLOAD_FOLDER + profile + '.txt'; // users[i] è  con @iniziale, username è senza @
    let username_file_new = NEW_DOWNLOAD_FOLDER  + profile + '.txt';
    let username_collections = JSON.parse(read_file(username_file));
    let username_collections_new = JSON.parse(read_file(username_file_new));
    let currentBot = getCurrentBot();
    let currentFile = username_collections[type][code];
    let newMedia;
    let updateNew = false;

    if(!currentFile) {
        return;
    }
    if(!currentBot) {
        return "apiNotLogged"
    }
    let items = await currentBot.ig.media.client.media.info(currentFile.id);
    items = items["items"];

    if( username_collections_new[type][code] ) updateNew = true;

    for(let j=0; j<items.length; j++){
        let item = items[j];
        if(!item) continue;
        if(item['video_versions']) {
            let media = item['video_versions'][0]['url'];
            newMedia = media;
        } else if(item['carousel_media']) {
            let carousel = item['carousel_media'];
            let carousel_media = carousel[currentFile.position];
            if(carousel_media['video_versions']){
                let carousel_child_media = carousel_media['video_versions'][0]['url'];
                newMedia = carousel_child_media;
            } else if(carousel_media['image_versions2']){
                let carousel_child_media = carousel_media['image_versions2']['candidates'][0]['url'];
                newMedia = carousel_child_media;
            }
        } else if(item['image_versions2']){
            let media = item['image_versions2']['candidates'][0]['url']; 
            newMedia = media;
        }
    }
    if(!newMedia){
        console.log("Failing restoration on media: " + uri + ", it is now deleted ( maybe was removed from the owner ) ");
        return;
    }
    if(currentFile.carousel){
        username_collections[type][code] = {
            'owner': currentFile.owner,
            'caption': currentFile.caption, 
            'id': currentFile.id,
            'url': newMedia,
            'position': currentFile.position,
            'carousel': true
        }
        if(updateNew ){
            username_collections_new[type][code] = {
                'owner': currentFile.owner,
                'caption': currentFile.caption, 
                'id': currentFile.id, 
                'url': newMedia,
                'position': currentFile.position,
                'carousel': true
            };
        }
    } else {
        username_collections[type][code] = {
            'owner': currentFile.owner,
            'caption': currentFile.caption, 
            'id': currentFile.id, 
            'url': newMedia
        }
        if(updateNew ){
            username_collections_new[type][code] = {
                'owner': currentFile.owner,
                'caption': currentFile.caption, 
                'id': currentFile.id, 
                'url': newMedia
            };
        }
    }
    
    write_file(username_file, JSON.stringify(username_collections));
    write_file(username_file_new, JSON.stringify(username_collections_new));
    return newMedia;
}

/*
@uri: string ( the link of the media to restore )
@type: string ( image/video )
@hashtag: string ( the hashtag of the link to restore )
@info: restore a selected media
*/
async function restoreMedia(code, uri, type, hashtag){
    let restoredUrl;
    console.log(code, uri, type, hashtag)
    try {
        if(hashtag.startsWith('@')){ 
            restoredUrl = await restoreProfileMedia(code, uri, type, hashtag);
        } else if(hashtag.startsWith('#')) {
            restoredUrl = await restoreHashtagMedia(code, uri, type, hashtag);
        }

    } catch(e) {
        console.log("Error restoring media: " + uri + ", ERROR: " + e);
    }
    return restoredUrl;
}


/*
@uri: string ( the link of the media to restore )
@type: string ( image/video )
@filename: the path to the file where to save the downloaded media (.jpg/.mp4)
@hashtag: string ( the hashtag of the link to restore )
@info: download a selected media
*/
function download(code, uri, type, filename, hashtag){
    return new Promise(async resolve => {
        var file = fs.createWriteStream(filename);
        res = request(uri).pipe(file);
        var restoredUrl;

        file.on('finish', async function() {
            file.close();
            let content = read_file(filename);
            if(content == 'URL signature expired'){
                try {
                    restoredUrl = await restoreMedia(code, uri, type, hashtag);
                    
                    if( restoredUrl ){
                        let correctDownload = await download(code, restoredUrl, type, filename, hashtag);
                        if( correctDownload ) resolve(restoredUrl);
                        else resolve(null);
                    } 
                } catch(e) {
                    show_popup(getCurrentUser(), 'restore fail', getCurrentUserAvatarPath(), "Error in restoring post: " + uri + ", of: " + hashtag);
                }
            }
            else resolve(uri);
        });
    });
};






/*






FILES MANAGEMENT.

MANAGE USED FILES
CREATE POSTER FOR UPLOAD
MANAGE SELECTION OF FILE TO UPLOAD











*/

/*
used from
-posts.js
-images.js

@post: jquery object
@info: electron local file upload interface
*/
function upload_image(post){
    remote.dialog.showOpenDialog(remote.getCurrentWindow(),
       {
        filters: [
          {name: 'files', extensions: ['jpg', 'mp4']}
        ]
       }, 
       function(filepaths, bookmarks) {
            //read image (note: use async in production)
            if(!filepaths.length) return;
            let type;
            let file = replaceAllChars(filepaths[0].trim(), " ", "%20");
            if(file.endsWith(".jpg")){
                type = "image";
            } else if (file.endsWith(".mp4")){
                type = "video";
            }
            add_file_to_post(post, file, type);
            post.attr("data-filePath", file);
            post.attr("data-fileType", type);
            return;
    });
}

// Create the poster for a video
// video: path string
// poster: path string

// PS: video-snapshot has been edited from me for work.
// ln 85:
//      FROM var url = URL.createObjectURL(blob);
//      TO   var url = blob;
// ln 104:
//      FROM dataURL = canvas.toDataURL();
//      TO   dataURL = canvas.toDataURL('image/jpeg', 1.0);

async function createPoster(video, poster){
    const snapshoter = new VideoSnapshot(video);
    var data = await snapshoter.takeSnapshot();
    data = data.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');
    fs.writeFileSync(poster, buf);
    return poster;
}
/*
@type: string [image, video]
@file: string [file link]
@hashtag: striong [ the hashtag of the link ]
@info: remove the given link from the hashtag file
*/
function remove_file_from_hashtag(file, type, hashtag){
    let files = JSON.parse(read_file(DOWNLOAD_FOLDER + hashtag + '.txt'));
    delete files[type][file];
    write_file(DOWNLOAD_FOLDER + hashtag + '.txt', JSON.stringify(files));
}

/*
@profile: string
@hashtags_: array of strings
@info: creates a random post/story to upload and append the selected file to the used files
@return: [upload, file_type, owner, caption, random_hashtag] || [null]
*/
function random_file_to_upload(profile, hashtags_){

    let hashtags = hashtags_.slice();
    do{

        let upload;
        let file_type;
        let owner;
        let caption;
        let code;

        let random_hashtag = hashtags[randomRange(0, hashtags.length - 1)];
        hashtags.remove(random_hashtag);
        let path = DOWNLOAD_FOLDER + random_hashtag + '.txt';

        if(random_hashtag.startsWith('!')){
            console.log("searching local file to upload")
            // is local file
            let localPath = random_hashtag.substring(1);
            let files = get_files(localPath);
            let max_range = files.length - 1;
            if(max_range == -1){
                continue;
            }
            do {
                let file_index = randomRange(0, max_range);
                upload = `${localPath}/${files[file_index]}`;
                if(is_image(upload)){
                    file_type = "image";
                    continue_ = false;
                    if(!upload.endsWith(".jpg")){
                        console.log("not valid");
                        show_popup(profile, 'file error', getUserAvatarPath(profile), `found a non jpg file in ${localPath}: ${upload}. Please convert it to jpg`);
                        
                        continue_ = true;
                    }
                } else if (is_video(upload)){
                    file_type = "video"
                    continue_ = false;
                    if(!upload.endsWith(".mp4")){
                        console.log("not valid");
                        show_popup(profile, 'file error', getUserAvatarPath(profile), `found a non mp4 file in ${localPath}: ${upload}. Please convert it to mp4`);

                        continue_ = true;
                    }
                }
                files.splice(file_index, 1);
                max_range --;
            console.log("CONDITION: ", max_range >= 0 && (check_file_in_used_list(profile, upload) || continue_));
            } while (max_range >= 0 && (check_file_in_used_list(profile, upload) || continue_))

            if(check_file_in_used_list(profile, upload)){
                continue;
            }
            console.log("found: ", upload, file_type)
            owner = "";
            caption = "";
            add_file_to_used_list(profile, upload)// local files uses abs_path to check if they were used
        } else if(!exists_file(path)){
            continue;
        } else {
            // is collected file
            let files = JSON.parse(read_file(path));
            let images_obj = files["image"];
            let videos_obj = files["video"];
            let images = Object.keys(images_obj);
            let videos = Object.keys(videos_obj);
            let max_range = images.length + videos.length - 1;

            if(max_range == -1){
                continue;
            } 
            do {

                let file_index = randomRange(0, max_range);
                if( file_index <= images.length - 1){
                    code = images[file_index];
                    upload = images_obj[code]['url'];
                    file_type = "image";
                    images.splice(file_index, 1);
                } else {
                    code = videos[file_index - images.length];
                    upload = videos_obj[code]['url'];
                    file_type = "video";
                    videos.splice(file_index, 1);
                }
                max_range --;
            } while (max_range >= 0 && check_file_in_used_list(profile, upload))

            if(check_file_in_used_list(profile, upload)){
                continue;
            }
            owner = files[file_type][code]["owner"];
            caption = files[file_type][code]["caption"];
            add_file_to_used_list(profile, upload); // downloaded files uses alphaNumeric id (code) to check if they were used
        }

        return [code, upload, file_type, owner, caption, random_hashtag]; //////////////////  <------

    } while(hashtags.length > 0);
    show_popup(profile, 'empty valid medias', getUserAvatarPath(profile), `no valid posts found, maybe you have already used all of them`);
    return [null];
}