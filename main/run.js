/*
Main 
Bot 
Logic
*/

/* TO DO *
// -- ITA --
// - aggiungere funzioni specifiche per inserire - eliminare immagini dai file ( come per used )

// - unfolloware la gente direttamente dalla lista invece di fare la comparazione della lista con
//   quelli che followa.

// - quando il menu a tendina è chiuso ( solo per la prima volta, 
// - dopo che viene selezionato un profilo non lo fa ( lo ho risolto ) )
// - se si clicca poco sotto i profili sono cambiati lo stesso

// - aggiungere un pulsante per nascondere tutte le notifiche

// - inserire le variabili prese da SETTINGS in un object invece che usare le variabili

// * SOLVED *


*/




/*
* External modules imports [Shared bewtween files] *
*/
const
    remote = require('electron').remote,
    app = remote.app,
    BrowserWindow = remote.BrowserWindow,
    net = remote.net,
    nativeImage   = remote.nativeImage,
    session = remote.session,
    mainWin = remote.getCurrentWindow(),
    request = require('request'),
    path = require('path'),
    {
        IgApiClient,
        IgCheckpointError,
        IgLoginTwoFactorRequiredError,
        IgLoginBadPasswordError,
        IgLoginRequiredError,
        IgLoginInvalidUserError
    } = require('instagram-private-api'),
    { StickerBuilder } = require('instagram-private-api/dist/sticker-builder'),
    Bluebird = require('bluebird'),
    { promisify } = require('util'),
    readFileAsync = promisify(fs.readFile),
    UserAgent = require('user-agents'),
    rp = require('request-promise'),
    open = require("open");

/*
 * Files management constants [Shared bewtween files]
 */
const
    DatasPath = app.getPath('userData') + '/',
    SHARED_DATAS_FL = DatasPath + 'datas/profiles.txt',
    DOWNLOAD_FOLDER = DatasPath + 'datas/downloads/',
    NEW_DOWNLOAD_FOLDER = DatasPath + 'datas/downloads/new/',
    PROFILES_FOLDER = DatasPath + 'datas/profiles/',
    TO_FOLLOW_FOLDER = DatasPath + 'datas/toFollow/',
    TO_UNFOLLOW_FOLDER = DatasPath + 'datas/toUnfollow/',
    USED_FILES_FOLDER = DatasPath + 'datas/used/',
    SESSIONS_FOLDER = DatasPath + 'datas/sessions/',
    STATS_FOLDER = DatasPath + 'datas/stats/',
    LOGS_FOLDER = DatasPath + 'datas/logs/',
    UPLOAD_FOLDER = DatasPath + 'datas/upload/',
    AVATARS_FOLDER = 'public/img/avatars',
    NO_RENDER_GRAPHS = ['public', 'private', 'noPost'],
    IMAGES_FL_DEFAULT_CONTENT = '{"image": {}, "video": {}, "count": 0}', //??//
    USED_FL_DEFAULT_CONTENT = '[0]',
    STATS_FL_DEFAULT_CONTENT =
    `{
"default_1": {"likes":0, "posts": 0, "following": 0, "followers": 0, "comments":0,"follow":0,"unfollow":0,"visited":0,"public":0,"private":0,"noPost":0}, 
"default_2": {"likes":0, "posts": 0, "following": 0, "followers": 0, "comments":0,"follow":0,"unfollow":0,"visited":0,"public":0,"private":0,"noPost":0}
 }`;

const LOGO_PATH = '../../public/img/logo.jpg';

/*
Filter used in populate_form() [custom-functions.js] that manage which field
of the forms display based on the page.
*/
const FORM_FILTERS = {
    "profiles": null, // all the fields are displayed
    "images": ["IMAGES COLLECTOR"],
    "posts": ["AUTO POST"],
    "stories": ["AUTO STORY"],
    "focus": ["FOCUS COMMENTS"],
    // the pages below have not a form inside
    "stats": null, 
    "logs": null,
    "dashboard": null
}

/*
 * Bot variables [Shared bewtween files]
 */

var

    ProfilesDatas = {
        "currentProfile": null,
        "shared": JSON.parse(read_file(SHARED_DATAS_FL)),
        "shared_fl": SHARED_DATAS_FL
    },
    post_id = 0,
    WARNING_INPUT_NOT_SENT = true,
    WARNING_INPUT_CODE;




var SETTINGS;
(async() => {

    SETTINGS = await rp('https://raw.githubusercontent.com/linch1-test/wiinsta_check/master/settings.json')
    .then( res => { return res;})
    .catch( err => { 
        let profiles = getAllProfiles();
        for( let i = 0; i < profiles.length; i ++){
            let profile_log_file = LOGS_FOLDER + profiles[i] + '.txt';
            let now = Date.now();
            let logs = JSON.parse(read_file(profile_log_file));
            logs[now] = ["error", "Error loading internal settings: " + err.toString()];
            write_file(profile_log_file, JSON.stringify(logs));
        }

        $(document).ready(function() {
            show_popup('wiinsta', 'Internal error', LOGO_PATH, 
                "error in loading bot internal settings, check your connection or restart the bot. Check any profile log for the error message.");
        });
        
    });

    /*
    Load selectors from external url
    */
    SETTINGS = JSON.parse(SETTINGS);
    console.log(SETTINGS)
    INSTAGRAM_LOGIN = SETTINGS["selectors"]["INSTAGRAM_LOGIN"];
    INSTAGRAM_BASE = SETTINGS["selectors"]["INSTAGRAM_BASE"];
    
    ACCEPT_COOCKIES = SETTINGS["selectors"]["ACCEPT_COOCKIES"];
    USERNAME_INPUT = SETTINGS["selectors"]["USERNAME_INPUT"];
    LOGIN_BUTTON = SETTINGS["selectors"]["LOGIN_BUTTON"];
    ERROR_PAGE = SETTINGS["selectors"]["ERROR_PAGE"];
    POST = SETTINGS["selectors"]["POST"];
    LIST_POSTS_BUTTON = SETTINGS["selectors"]["LIST_POSTS_BUTTON"];

    PROFILE_STATS = SETTINGS["selectors"]["PROFILE_STATS"];
    STAT_POSTS = SETTINGS["selectors"]["STAT_POSTS"];
    STAT_FOLLOWERS = SETTINGS["selectors"]["STAT_FOLLOWERS"];
    STAT_FOLLOWING = SETTINGS["selectors"]["STAT_FOLLOWING"];

    PRIVATE_PROFILE = SETTINGS["selectors"]["PRIVATE_PROFILE"];
    NO_POST_PROFILE = SETTINGS["selectors"]["NO_POST_PROFILE"];
    OPENED_POST = SETTINGS["selectors"]["OPENED_POST"];
    LIKE_BUTTON = SETTINGS["selectors"]["LIKE_BUTTON"];
    COMMENT_BUTTON = SETTINGS["selectors"]["COMMENT_BUTTON"];
    COMMENT_TEXTAREA = SETTINGS["selectors"]["COMMENT_TEXTAREA"];
    SUBMIT_COMMENT = SETTINGS["selectors"]["SUBMIT_COMMENT"];
    CLOSE_POST_BUTTON = SETTINGS["selectors"]["CLOSE_POST_BUTTON"];

    BLOCKED_ACTIONS = SETTINGS["selectors"]["BLOCKED_ACTIONS"];

    PROFILE_HEADER = SETTINGS["selectors"]["PROFILE_HEADER"];
    FOLLOW_BUTTON = SETTINGS["selectors"]["FOLLOW_BUTTON"];
    FOLLOW_BUTTON_1 = SETTINGS["selectors"]["FOLLOW_BUTTON_1"];

    UNFOLLOW_NAME_DIV = SETTINGS["selectors"]["UNFOLLOW_NAME_DIV"]; // HAS to be without the dot.
    UNFOLLOW_BUTTON = SETTINGS["selectors"]["UNFOLLOW_BUTTON"];
    CONFIRM_UNFOLLOW_BUTTON = SETTINGS["selectors"]["CONFIRM_UNFOLLOW_BUTTON"];

    FOLLOWING_PROFILES_LIST_TO_SCROLL = SETTINGS["selectors"]["FOLLOWING_PROFILES_LIST_TO_SCROLL"];
    FOLLOWING_PROFILES_LIST_TO_GET_HEIGHT = SETTINGS["selectors"]["FOLLOWING_PROFILES_LIST_TO_GET_HEIGHT"];

    MOST_POPULAR_POSTS = SETTINGS["selectors"]["MOST_POPULAR_POSTS"];
    POPULAR_POST = SETTINGS["selectors"]["POPULAR_POST"];
    POPULAR_POST_IMAGE = SETTINGS["selectors"]["POPULAR_POST_IMAGE"];
    POPULAR_POST_OWNER = SETTINGS["selectors"]["POPULAR_POST_OWNER"];
    POPULAR_POST_CAROUSEL_BUTTON = SETTINGS["selectors"]["POPULAR_POST_CAROUSEL_BUTTON"];
    POPULAR_POST_CAROUSEL_IMAGES = SETTINGS["selectors"]["POPULAR_POST_CAROUSEL_IMAGES"];
    POPULAR_POST_VIDEO_BUTTON = SETTINGS["selectors"]["POPULAR_POST_VIDEO_BUTTON"];
    POPULAR_POST_VIDEO_LINK = SETTINGS["selectors"]["POPULAR_POST_VIDEO_LINK"];

    NEW_POST = SETTINGS["selectors"]["NEW_POST"];
    LOAD_IMAGE = SETTINGS["selectors"]["LOAD_IMAGE"];
    CANNOT_LOAD_STORY = SETTINGS["selectors"]["CANNOT_LOAD_STORY"];

    UPLOAD_POST_DATAS = SETTINGS["selectors"]["UPLOAD_POST_DATAS"];
    CAPTION_SECTION = SETTINGS["selectors"]["CAPTION_SECTION"];
    CAPTION_TEXTAREA = SETTINGS["selectors"]["CAPTION_TEXTAREA"];

    POST_TAGS_SECTION = SETTINGS["selectors"]["POST_TAGS_SECTION"];
    POST_TAGS_BUTTON = SETTINGS["selectors"]["POST_TAGS_BUTTON"];

    INSTAGRAM_DM = SETTINGS["selectors"]["INSTAGRAM_DM"];
    POPUP_DM_PAGE = SETTINGS["selectors"]["POPUP_DM_PAGE"];
    SEARCH_BUTTON_DM_PAGE = SETTINGS["selectors"]["SEARCH_BUTTON_DM_PAGE"];
    SEARCH_TEXT_FIELD_NAME = SETTINGS["selectors"]["SEARCH_TEXT_FIELD_NAME"];
    FOUND_USER = SETTINGS["selectors"]["FOUND_USER"];
    OPEN_CHAT_BUTTON = SETTINGS["selectors"]["OPEN_CHAT_BUTTON"];
    SUBMIT_BUTTON_DM = SETTINGS["selectors"]["SUBMIT_BUTTON_DM"];

    let notify_id = SETTINGS["pushNotification"].id;
    if (notify_id != -1 && notify_id != getShared()['last-notification-id']) {
        /*
        Check if there are some notify to display
        */
        window.addEventListener('load', () => { 
            show_popup('wiinsta', 'notification', LOGO_PATH, SETTINGS["pushNotification"].notify); 
        });
        show_popup('wiinsta', 'notification', LOGO_PATH, SETTINGS["pushNotification"].notify);
        getShared()['last-notification-id'] = notify_id;
        write_file(SHARED_DATAS_FL, JSON.stringify(getShared()));
    }

    let welcome = getShared()["welcome-message"];
    if(!welcome){
        $(document).ready(function() {
            show_popup('wiinsta', 'welcome', LOGO_PATH, SETTINGS["welcome-message"]);

            // to make sure that all custom settings are initialized correctly i call this 500ms after.
            // without it gives errors.
            setTimeout( () => {
                getCurrentPage().find("a.help-link").click();
            }, 500);
        });
        getShared()['welcome-message'] = true;
        write_file(SHARED_DATAS_FL, JSON.stringify(getShared()));
    }
    if (SETTINGS["forceUpdate"].status) {
        /*
        Checck if it has to force the user to update
        */
        $(document).ready(function() {
            show_popup('wiinsta', 'invalid version', LOGO_PATH, 
                `the current version (${app.getVersion()}) of wiinsta it is no longer functional, please download the latest version: ` + SETTINGS["forceUpdate"].version);
            $('body').click(evt => {
                let w = remote.getCurrentWindow();
                w.close();
            })
        });
    }



})();

var INSTAGRAM_LOGIN,
    INSTAGRAM_BASE,

    // SELECTORS
    ACCEPT_COOCKIES,
    USERNAME_INPUT,
    LOGIN_BUTTON,
    ERROR_PAGE,
    POST,
    LIST_POSTS_BUTTON,

    PROFILE_STATS,
    STAT_POSTS,
    STAT_FOLLOWERS,
    STAT_FOLLOWING,

    PRIVATE_PROFILE,
    NO_POST_PROFILE,

    OPENED_POST,
    LIKE_BUTTON,
    COMMENT_BUTTON,
    COMMENT_TEXTAREA,
    SUBMIT_COMMENT,
    CLOSE_POST_BUTTON,

    BLOCKED_ACTIONS,

    PROFILE_HEADER,
    FOLLOW_BUTTON,
    FOLLOW_BUTTON_1,

    UNFOLLOW_NAME_DIV, // HAS to be without the dot.
    UNFOLLOW_BUTTON,
    CONFIRM_UNFOLLOW_BUTTON,

    FOLLOWING_PROFILES_LIST_TO_SCROLL,
    FOLLOWING_PROFILES_LIST_TO_GET_HEIGHT,

    MOST_POPULAR_POSTS,
    POPULAR_POST,
    POPULAR_POST_IMAGE,
    POPULAR_POST_OWNER,
    POPULAR_POST_CAROUSEL_BUTTON,
    POPULAR_POST_CAROUSEL_IMAGES,
    POPULAR_POST_VIDEO_BUTTON,
    POPULAR_POST_VIDEO_LINK,

    NEW_POST,
    LOAD_IMAGE,
    CANNOT_LOAD_STORY,

    UPLOAD_POST_DATA,
    CAPTION_SECTION,
    CAPTION_TEXTAREA,

    POST_TAGS_SECTION,
    POST_TAGS_BUTTON,

    INSTAGRAM_DM,
    POPUP_DM_PAGE,
    SEARCH_BUTTON_DM_PAGE,
    SEARCH_TEXT_FIELD_NAME,
    FOUND_USER,
    OPEN_CHAT_BUTTON,
    SUBMIT_BUTTON_DM,

    ACTIVE;

/*
ProfilesDatas = {
	"shared": {},
	"currentPage": "profiles",
	"currentProfile": "prof1",
	"profiles": [],
	"prof1": {
		"settings..."
	}
}
*/
function checkProfileDatas(profile_name, storage){
    let S = storage[profile_name] = {};
    /*
     * Create the igAPI object
     */
    S["api"] = new IgApiClient();
    S["bot"] = null;
    /*
     * Build files paths based on the profile
     */
    S["profile_fl"] = PROFILES_FOLDER + profile_name + '.txt';
    S["to_follow_fl"] = TO_FOLLOW_FOLDER + profile_name + '.txt';
    S["to_unfollow_fl"] = TO_UNFOLLOW_FOLDER + profile_name + '.txt';
    S["used_images_fl"] = USED_FILES_FOLDER + profile_name + '.txt';
    S["stats_fl"] = STATS_FOLDER + profile_name + '.txt';
    S["session"] = SESSIONS_FOLDER + profile_name + '.txt';
    S["download_folder"] = DOWNLOAD_FOLDER;
    S["download_new_folder"] = NEW_DOWNLOAD_FOLDER;
    S["logs_fl"] = LOGS_FOLDER + profile_name + '.txt';
    S["upload_folder"] = UPLOAD_FOLDER + profile_name;
    S["upload_img_path"] = UPLOAD_FOLDER + profile_name + '/image.jpg';
    S["upload_vd_path"] = UPLOAD_FOLDER + profile_name + '/video.mp4';

    /*
     * Create all files ( it does nothing if the folder/file already exists )
     */
    create_dir(S["upload_folder"]);
    create_file(S["session"], '{}');
    create_file(S["used_images_fl"], USED_FL_DEFAULT_CONTENT);
    create_file(S["logs_fl"], '{}');
    create_file(S["to_follow_fl"], '[]');
    create_file(S["to_unfollow_fl"], '[]');
    create_file(S["upload_img_path"], '');
    create_file(S["upload_vd_path"], '');
    create_file(S["stats_fl"], STATS_FL_DEFAULT_CONTENT);

    /*
     * Read the datas inside main files
     */
    S["logs"] = JSON.parse(read_file(S["logs_fl"], 'utf-8'));
    S["stats"] = JSON.parse(read_file(S["stats_fl"], 'utf-8'));
    S["used"] = JSON.parse(read_file(S["used_images_fl"], 'utf-8'));
    S["profile"] = JSON.parse(read_file(S["profile_fl"]));
    S["toFollow"] = JSON.parse(read_file(S["to_follow_fl"]));
    S["toUnfollow"] = JSON.parse(read_file(S["to_unfollow_fl"]));

    /*
     * create media storage files
     */
    for (let i = 0; i < S["profile"]['hashtags'].length; i++) {
        if (S["profile"]['hashtags'][i].startsWith("!")) return;
        create_file(S["download_folder"] + S["profile"]['hashtags'][i] + '.txt', IMAGES_FL_DEFAULT_CONTENT);
    }
}

// Read and load the profiles datas at the bot open
function readProfileDatas(storage) {
    let files = get_files(PROFILES_FOLDER);

    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        profile_name = file.substring(0, file.length - 4);
        checkProfileDatas(profile_name, storage)
    }
}
readProfileDatas(ProfilesDatas);



/*
Create the bot profile window on run
*/
function createWindow(session_id, profile) {
    let preferences = {};
    if (session_id) {
        preferences.partition = 'persist:' + session_id;
    }
    let width = 400;
    let height = 400;
    win = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: preferences,
    });

    win.setIcon(
        nativeImage.createFromPath(
          path.join(__dirname, "/public/img/logo.png")
        )
      );
    win.setMenuBarVisibility(false);
    win.setResizable(true);
    ses = win.webContents.session;
    let useragent = new UserAgent({ deviceCategory: 'mobile' }).toString();
    win.webContents.setUserAgent(useragent);
    win.loadURL(INSTAGRAM_LOGIN);
    win.on('closed', () => {
        let bot = getProfileBot(profile);
        if(bot) bot.status = false;
    });
    return win;
}

// save api coockies
function fakeSave(path, data) {
    fs.writeFileSync(path, JSON.stringify(data), 'utf8');
    return data;
}

// check if api session exists
function fakeExists(path) {
    let datas = fs.readFileSync(path, 'utf-8');
    if (datas.length > 1) return true;
    else return false;
}

// load api session
function fakeLoad(path) {
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

// needed for api posts with tag
function clamp(value, min, max) {
    return Math.max(Math.min(value, max), min);
};

/*
 * 
 */
class instabot {

    constructor(profile_name) {
        let S = ProfilesDatas[profile_name];

        this.profile_name = profile_name;
        this.PROFILE_FL = S["profile_fl"];
        this.TO_FOLLOW_FL = S["to_follow_fl"];
        this.TO_UNFOLLOW_FL = S["to_unfollow_fl"];
        this.USED_IMAGES_FL = S["used_images_fl"];
        this.STATS_FL = S["stats_fl"];
        this.SESSION = S["session"];
        this.DOWNLOAD_FOLDER = S["download_folder"];
        this.DOWNLOAD_NEW_FOLDER = S["download_new_folder"];
        this.LOGS_FL = S["logs_fl"];
        this.UPLOAD_FOLDER = S["upload_folder"];
        this.UPLOAD_IMG_PATH = S["upload_img_path"];
        this.UPLOAD_VD_PATH = S["upload_vd_path"];

        this.LOGS = S["logs"] = {};
        this.STATS = S["stats"];
        this.USED = S["used"];
        this.PROFILE = S["profile"];

        let today = new Date();
        this.day = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`

        if (!this.STATS[this.day]) {
            this.STATS[this.day] = {
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
            }
        }

        this.logged = false;
        this.blocked_actions_time = this.PROFILE['blocked_actions_time'];
        if (this.blocked_actions_time) {
            this.add_log("error", `In the previous bot session this profile had the actions blocked, will check again if 6hrs are passed from the last session.`);
            this.blocked_actions = true;
        }

        this.followNoPost = this.PROFILE['follow_noPost'];
        this.followPrivate = this.PROFILE['follow_private'];
        this.followPublic = this.PROFILE['follow_public'];
        this.unfollow = this.PROFILE['unfollow'];
        this.leftComment = this.PROFILE['left_comment'];
        this.leftLike = this.PROFILE['left_like'];
        this.leftMessage = this.PROFILE['left_message'];
        this.numberOfComments = this.PROFILE['number_of_comments'];
        this.numberOfLikes = this.PROFILE['number_of_likes'];
        this.username = this.PROFILE['username'];
        this.password = this.PROFILE['password'];
        this.sessionId = this.PROFILE['session_id'];
        this.commentText = this.PROFILE['comment'];
        this.messageText = this.PROFILE['message'];
        this.delay = this.PROFILE['delay'];

        this.random_time = this.PROFILE['random_time'];

        this.random_actions = this.PROFILE['random_actions'];
        this.startUnfollow = this.PROFILE['start_unfollow'];
        this.followedRange = this.PROFILE['followed_range'];
        this.collectFollowingDelay = this.PROFILE['collect_following_time'];
        this.collectToFollowDelay = this.PROFILE['collect_to_follow_time'];
        this.collectProfilesPages = this.PROFILE['pages_for_porifle_collection'];

        this.max_follow = this.PROFILE['follow_per_day'];
        this.max_likes = this.PROFILE['likes_per_day'];
        this.max_comments = this.PROFILE['comment_per_day'];
        this.max_unfollow = this.PROFILE['unfollow_per_day'];
        this.max_messages = this.PROFILE['message_per_day'];

        this.hashtags = this.PROFILE['hashtags'];
        this.collectImages = this.PROFILE['collect_images'];
        this.collectImagesDelay = this.PROFILE['collect_images_delay'] * 60 * 1000; // come input vuole minuti
        this.collectImagesTimes = this.PROFILE['collect_images_times'];
        this.collectImagesLastTime = this.PROFILE['collect_images_last_time'];

        this.captions = this.PROFILE['captions'];
        this.captionsToUse = this.PROFILE['captions_to_use'];
        this.autoPost = this.PROFILE['auto_post'];
        this.randomPost = this.PROFILE['random_post'];
        this.randomPostDelay = this.PROFILE['random_post_delay'] * 60 * 1000; // come input vuole minuti
        this.randomPostLastTime = this.PROFILE['random_post_last_time'];
        this.scheduledPosts = this.PROFILE['scheduled_posts'];

        this.autoStory = this.PROFILE['auto_story'];
        this.randomStory = this.PROFILE['random_story'];
        this.randomStoryDelay = this.PROFILE['random_story_delay'] * 60 * 1000; // come input vuole minuti
        this.randomStoryLastTime = this.PROFILE['random_story_last_time'];
        this.scheduledStories = this.PROFILE['scheduled_stories'];

        this.focusPost = this.PROFILE['focus_post'];
        this.focusComments = this.PROFILE['focus_comment'];
        this.focusDelay = this.PROFILE['focus_delay'];
        this.focusInFlow = this.PROFILE['focus_in_flow'];

        this.avatar = getAvatarPath(this.PROFILE['profile_avatar']);
        this.process_count = 0;
        this.followed_count = 0;
        this.unfollowed_count = 0;
        this.likes_count = 0;
        this.comments_count = 0;

        this.status = true;
        this.ig = S["api"];
    }

    /*
    @info: is called when the profile datas are updated in the gui
    */
    reloadSettings() {
        let S = ProfilesDatas[this.profile_name];
        S["profile"] = this.PROFILE = JSON.parse(read_file(S["profile_fl"]));

        this.followNoPost = this.PROFILE['follow_noPost'];
        this.followPrivate = this.PROFILE['follow_private'];
        this.followPublic = this.PROFILE['follow_public'];
        this.unfollow = this.PROFILE['unfollow'];
        this.leftComment = this.PROFILE['left_comment'];
        this.leftMessage = this.PROFILE['left_message'];
        this.leftLike = this.PROFILE['left_like'];

        this.numberOfComments = this.PROFILE['number_of_comments'];
        this.numberOfLikes = this.PROFILE['number_of_likes'];
        this.username = this.PROFILE['username'];
        this.password = this.PROFILE['password'];
        this.sessionId = this.PROFILE['session_id'];

        this.commentText = this.PROFILE['comment'];
        this.messageText = this.PROFILE['message'];

        this.delay = this.PROFILE['delay'];
        this.random_time = this.PROFILE['random_time'];
        this.random_actions = this.PROFILE['random_actions'];
        this.startUnfollow = this.PROFILE['start_unfollow'];
        this.followedRange = this.PROFILE['followed_range'];
        this.collectFollowingDelay = this.PROFILE['collect_following_time'];
        this.collectToFollowDelay = this.PROFILE['collect_to_follow_time'];
        this.collectProfilesPages = this.PROFILE['pages_for_porifle_collection'];

        this.max_follow = this.PROFILE['follow_per_day'];
        this.max_likes = this.PROFILE['likes_per_day'];
        this.max_comments = this.PROFILE['comment_per_day'];
        this.max_unfollow = this.PROFILE['unfollow_per_day'];
        this.max_messages = this.PROFILE['message_per_day'];

        this.hashtags = this.PROFILE['hashtags'];
        this.collectImages = this.PROFILE['collect_images'];
        this.collectImagesDelay = this.PROFILE['collect_images_delay'] * 60 * 1000; // come input vuole minuti
        this.collectImagesTimes = this.PROFILE['collect_images_times'];
        this.collectImagesLastTime = this.PROFILE['collect_images_last_time'];
        this.captions = this.PROFILE['captions'];
        this.captionsToUse = this.PROFILE['captions_to_use'];
        this.autoPost = this.PROFILE['auto_post'];
        this.randomPost = this.PROFILE['random_post'];
        this.randomPostDelay = this.PROFILE['random_post_delay'] * 60 * 1000; // come input vuole minuti
        this.randomPostLastTime = this.PROFILE['random_post_last_time'];
        this.scheduledPosts = this.PROFILE['scheduled_posts'];
        this.autoStory = this.PROFILE['auto_story'];
        this.randomStory = this.PROFILE['random_story'];
        this.randomStoryDelay = this.PROFILE['random_story_delay'] * 60 * 1000; // come input vuole minuti
        this.randomStoryLastTime = this.PROFILE['random_story_last_time'];
        this.scheduledStories = this.PROFILE['scheduled_stories'];

        this.focusPost = this.PROFILE['focus_post'];
        this.focusComments = this.PROFILE['focus_comment'];
        this.focusDelay = this.PROFILE['focus_delay'];
        this.focusInFlow = this.PROFILE['focus_in_flow'];

    }

    /*
    @type: string --> ["error", "warning", "succes", ""]
    @message: string
    @info: add the message of the given type to the profile log file
    */
    add_log(type, message) {
        // TYPES: info, success, warning, error;
        let now = Date.now();
        this.LOGS[now] = [type, message];
        // console.log("Adding log " + message );
        // console.log("Log file: " + this.LOGS_FL, this.LOGS);
        write_file(this.LOGS_FL, JSON.stringify(this.LOGS));
    }

    /*
    @session_id: int // the partition id of the current profile
    @info: clear the electron session bound to the profile
    */
    clear_partition(session_id) {
        let ses = session.fromPartition('persist:' + this.sessionId)
        ses.clearStorageData();
        this.PROFILE['first_login'] = 0;
        write_file(this.PROFILE_FL, JSON.stringify(this.PROFILE));
        write_file(this.SESSION, "{}");
    }

    /*
    @info: remove the profile files and clears the profile session
    */
    delete() {
            // this
            this.clear_partition();
            deleteFolderRecursive(this.UPLOAD_FOLDER);
            remove_file(this.PROFILE_FL);
            remove_file(this.STATS_FL);
            remove_file(this.TO_FOLLOW_FL);
            remove_file(this.TO_UNFOLLOW_FL);
            remove_file(this.USED_IMAGES_FL);
            remove_file(this.SESSION);
        }
        /*
        @info: does the api login and manage the display of the alert-box-input for the 2FA code
        */
    async ig_api_login() {

            show_popup(this.profile_name, 'login', this.avatar, 
                `Bot is currently running [ wait for the login process to complete 15-20 s ]`);
            
            if (this.logged || !this.is_open()) {
     
                return;
            }
            this.logged = true;
            this.add_log("info", "Doing IG API login");
            let shouldLogin = true;
            this.ig.state.generateDevice(this.username);
            await this.ig.qe.syncLoginExperiments();
            this.ig.request.end$.subscribe(async() => {
                const serialized = await this.ig.state.serialize();
                delete serialized.constants;
                fakeSave(this.SESSION, serialized);
            });
            if (fakeExists(this.SESSION)) {
                console.log("loading session")
                try {
                    let session_datas = fakeLoad(this.SESSION);
                    if (Object.keys(session).length == 0) {
                        throw new Error('Empty session');
                    }
                    const auth = await this.ig.state.deserialize();
                    await this.ig.user.info(this.ig.state.cookieUserId);
                    process.nextTick(async() => await this.ig.simulate.postLoginFlow());
                    shouldLogin = false;
                    if (!auth) {
                        throw new Error('Undefined auth');
                    }
                    this.add_log("success", "IG API restored from previous session");
                } catch (e) {
                    this.add_log("warning", "IG API not restored from previous session, doing login");
                }
            }
            if (shouldLogin == true) {
                await this.ig.simulate.preLoginFlow();
                await Bluebird.try(async() => {
                        const auth = await this.ig.account.login(this.username, this.password);
                        if( auth && auth.profile_pic_url ) {
                            this.PROFILE["profile_image"] = auth.profile_pic_url;
                            write_file(this.PROFILE_FL, JSON.stringify(this.PROFILE));
                        }
                        this.add_log("success", "IG API login done");
                    }).catch(IgCheckpointError, async() => {

                        let done;
                        // console.log(this.ig.state.checkpoint); // Checkpoint info here
                        await this.ig.challenge.auto(true); // Requesting sms-code or click "It was me" button
                        // console.log(this.ig.state.checkpoint); // Challenge info here
                        while (!done) {
                            show_popup_input(this.profile_name, 'login', this.avatar, "Instagram has sent an sms with a code verification, insert it in the box");
                            
                            let code = await get_alert_input();
                            // Use the code to finish the login process
                            await this.ig.challenge.sendSecurityCode(code)
                                .then(res => {
                                    done = true;
                                    show_popup(this.profile_name, 'login', this.avatar, `Login done`);
                                    this.add_log("success", "IG API login done");
                                })
                                .catch(e => {
                                    show_popup(this.profile_name, 'login', this.avatar, `Error in API login: ${e}`);
                                    console.log(e);
                                    done = null;
                                });

                        }


                    }).catch(IgLoginTwoFactorRequiredError, async err => {

                        const { username, totp_two_factor_on, two_factor_identifier } = err.response.body.two_factor_info;
                        // decide which method to use
                        const verificationMethod = totp_two_factor_on ? '0' : '1'; // default to 1 for SMS
                        // At this point a code should have been sent
                        // Get the code
                        let done;
                        while (!done) {
                            show_popup_input(this.profile_name, 'login', this.avatar, ` Insert the 2FA Auth code in the upper box`);
                            let code = await get_alert_input();
                            // Use the code to finish the login process
                            await this.ig.account.twoFactorLogin({
                                    username,
                                    verificationCode: code,
                                    twoFactorIdentifier: two_factor_identifier,
                                    verificationMethod, // '1' = SMS (default), '0' = TOTP (google auth for example)
                                    trustThisDevice: '1', // Can be omitted as '1' is used by default
                                })
                                .then(res => {
                                    done = true;
                                    show_popup(this.profile_name, 'login', this.avatar, `Login done`);
                                    this.add_log("success", "IG API login done");
                                })
                                .catch(e => {
                                    show_popup(this.profile_name, 'login', this.avatar, `Error in API login: ${e}`);
                                    console.log(e);
                                    done = null;
                                });
                        }
                    })
                    .catch(IgLoginBadPasswordError, err => {
                        console.log("bad password", err);
                        show_popup(this.profile_name, 'login', this.avatar, `Wrong login password`);
                        this.add_log("error", "IG bad login password");
                    })
                    .catch(IgLoginInvalidUserError, err => {
                        show_popup(this.profile_name, 'login', this.avatar, `Wrong login username`);
                        this.add_log("error", "IG bad login user");
                    })
                    .catch(e => {
                        console.log('Could not resolve checkpoint:\n\n', e, "\n\n", e.stack);
                        let error = e.toString();
                        show_popup(this.profile_name, 'login', this.avatar, `Error in API login: ` + e);
                    });

            }

            await this.ig.simulate.postLoginFlow();
   

        }
        /*
        @info: 
        - creates the electron window
        - does the api login
        - does the browser login
        - checks if the two factor is required in the window
        */
    async login() {
        if (!this.account_window || this.account_window.isDestroyed()) {
            this.account_window = createWindow(this.sessionId, this.profile_name);
        }

        //await this.ig_api_login();
        await this.define_sleep();
        this.add_log("info", "Doing Browser login");
        if(!this.is_open()) return;
        await this.account_window.webContents.executeJavaScript(`

            function accept_cookies(){
                let accept_coockies = document.querySelector('${ACCEPT_COOCKIES}');
                if(accept_coockies) accept_coockies.click()
            }

			async function demo() {
				while (!document.querySelector("${USERNAME_INPUT}")){
					await sleep(1000);
					if (window.location){
						if (!window.location.href.includes('login')){
                            accept_cookies();
							return;
						}

					}
					
				}
                accept_cookies();
				const setValue = Object.getOwnPropertyDescriptor(
					window.HTMLInputElement.prototype,
					"value"
				).set;
				const modifyInput = (name, value) => {
					const input = document.getElementsByName(name)[0];
					setValue.call(input, value);
					input.dispatchEvent(new Event('input', { bubbles: true}));
				}
				modifyInput('username', '` + this.username + `');
				modifyInput('password', '` + this.password + `');
				await sleep(1000);
				const button = document.querySelector("${LOGIN_BUTTON}");
				button.click();
				return;
				}
			demo();
		`);
        this.add_log("success", "Browser login done");
        await sleep(5000);
        await this.check_two_factor();
        return;
    }

    /*
    @info: cehck if the two factor is requires, if it is the login is paused until the user fill it.
    */
    async check_two_factor() {
      
       
        await this.define_sleep();
            let two_fac = await this.account_window.webContents.executeJavaScript(`
			var two_fac;
			async function two_factor_check() {
				while (window.location.href.includes("login")){
					if(window.location.href.includes("two_factor")) {
						two_fac = true;
						break
					};	
				}
			}
			two_factor_check();
			two_fac;
		`);
        if (!two_fac) {
         
            return;
        }
        show_popup(this.profile_name, 'login', this.avatar, `Instagram is requiring for two factor auth code in the profile opened window`);
        this.add_log("warning", "Browser sent 2FA Auth code ");

        let continue_ = false;
        while (continue_ === false && this.is_open()) {
            setTimeout(async() => {
                continue_ = await this.account_window.webContents.executeJavaScript(`
				!window.location.href.includes("two_factor")
			`);
            }, 1000);
            await sleep(1000);
        }
       
        return;
       
    }
    /*
    @user: string
    @info: Load the given user profile
    */
    async visit_user(user) {
        
        try {
            await this.account_window.loadURL(INSTAGRAM_BASE + `/${user}`);
        } catch (e) {
            this.add_log("warning", `Error in visit user ${e}`);
        }

        // attendi qualche minuto prima di riprovare selector
        //.error-container.-cx-PRIVATE-ErrorPage__errorContainer.-cx-PRIVATE-ErrorPage__errorContainer__

        let found = await this.account_window.webContents.executeJavaScript(`
			found = document.querySelector('${ERROR_PAGE}') ? true: false;
			found
		`);

        // if(found === true){
        // 	this.add_log("error", `Some resticrons has been applied on this account, sleeping for 60 min`);
        // 	await sleep(60 * 60 * 1000);
        // 	await this.account_window.loadURL(INSTAGRAM_BASE + `/${user}`);
        // }

        
        return;
       
    }

    /*
    @info: check if the visited user is private, noPost or public
    @return: user type string
    */
    check_user_type() {
        return this.account_window.webContents.executeJavaScript(`
	        	let posts = document.querySelectorAll("${POST}");
	        	if (posts.length > 0){
	        		'public'
	        	} else {
	        		if (document.querySelector("${PRIVATE_PROFILE}")){
	        			'private'
	        		} else if (document.querySelector("${NO_POST_PROFILE}")){
	        			'noPost'
	        		} else {
	        			'none'
	        		}
	        		
	        	}`);

    }
    /*
    @info: open the profile posts page
    */
    list_posts() {
        return this.account_window.webContents.executeJavaScript(`
		async function list_posts(){
			let list_posts = document.querySelector('a[href="/${this.current_user}/feed/"]');
			list_posts.click();
			await sleep(2000);
		}

		list_posts();
	`);
    }

    /*
    @info: runs the focus comment action, it will go to the given post and left the given comments each given delay.
    */
    async focus(){
        this.add_log("info", `Starting Focus on post: ${this.focusPost}`);
        await this.check_actions_blocked();
        await this.focus_action();
        this.add_log("info", `Focus is ended`);
    }

    async focus_action(){
        await this.focus_comment_action();
        await sleep(this.focusDelay * 1000);
        if (this.is_open()) this.focus_action()
    }

    async focus_comment_action() {
        if (this.blocked_actions) return;
        await this.account_window.loadURL(this.focusPost);
        await this.comment_action_logic(this.focusComments, 1, true);
        this.add_log("info", `Left Focus comment`);
    }

    /*
    @info: left the likes to the profile page based on the settings
    */
    async likes_action() {
        
        this.STATS[this.day]['public'] ++;
        if (this.blocked_actions) {
            return;
        }
        let likes_to_left = (this.leftLike) ? ((this.random_actions === true) ? randomRange(1, this.numberOfLikes) : this.numberOfLikes) : 0;

        if (likes_to_left == 0 || this.STATS[this.day]['likes'] > this.max_likes){
            this.add_log('info', `Not lefting likes`);
            return;
        }

        this.add_log("info", `Lefting ${likes_to_left} likes`);
        await this.account_window.webContents.executeJavaScript(`
			// posts vengono definiti in this.check_user_type quindi non c'è bisogno di redifinirli

			async function send_likes() {
				likes = document.querySelectorAll("${OPENED_POST} ${LIKE_BUTTON}");

				for (let i=0; i<likes.length; i++){

					let click_like = i + 1 <= ${likes_to_left};
					if (!click_like){
						break;
					} else {
						let like = likes[i];
						if (like && ${this.leftLike} === true){
							like.click();
						}
						await sleep(1000)
					}
				}
			}

			send_likes()
		`);

        this.STATS[this.day]['likes'] = parseInt( this.STATS[this.day]['likes']) + parseInt(likes_to_left);
    }

    /*
    @info: left the comments to the profile page based on the settings
    */
    async comments_action() {
            
            if (this.blocked_actions) return;
            
            let comments_to_left = (this.leftComment) ? ((this.random_actions === true) ? randomRange(0, this.numberOfComments) : parseInt(this.numberOfComments)) : 0;
            
            if (comments_to_left == 0 || this.STATS[this.day]['comments'] > this.max_comments) {
                this.add_log('info', `Not lefting comments`);
                return;
            }
            this.add_log("info", `Lefting ${comments_to_left} comments`);

            await this.comment_action_logic(this.commentText, comments_to_left, this.leftComment)

            this.STATS[this.day]['comments'] = parseInt(this.STATS[this.day]['comments']) + parseInt(comments_to_left);
 
    }
    /*
    @info: the logic for left a comment
    @comment: the comments to left ( array of strings )
    @comments_to_left: number of comments ( int )
    @leftComment: if it has to left comment or not
    */
    async comment_action_logic(comments, comments_to_left, leftComment){

        console.log(comments, comments_to_left, leftComment)
        if(!leftComment) return;
        if (!comments_to_left) comments_to_left = 1
        await this.define_sleep();
        await this.account_window.webContents.executeJavaScript(`
            // posts vengono definiti in this.check_user_type quindi non c'è bisogno di redifinirli
            const set_comment = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;

            const write_comment = (selector, value) => {
                const textarea = document.querySelector(selector);
                set_comment.call(textarea, value);
                textarea.dispatchEvent(new Event('input', { bubbles: true}));
            }
            function randomRange(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1)) + min; //Il max è incluso e il min è incluso 
            }

            async function send_comments() {
                let comments = ${JSON.stringify(comments)};
                let comment_buttons = document.querySelectorAll("${COMMENT_BUTTON}");
                for (let i=0; i<comment_buttons.length; i++){

                    let click_comment = i + 1 <= ${comments_to_left};
                    if (!click_comment){
                        await sleep(60000);
                        break;
                    }
        
                    comment_buttons = document.querySelectorAll("${COMMENT_BUTTON}");
                    let comment_button = comment_buttons[i];
                    comment_button.click();
                    await sleep(2000);
                    let comment_input = document.querySelector("${COMMENT_TEXTAREA}");
                    
                    if(comment_input){
                        if (click_comment){
                            
                            console.log(comments)
                            let comment = comments[randomRange(0, comments.length - 1)];
                            write_comment('${COMMENT_TEXTAREA}', comment);
                            await sleep(1000);
                            let submit_comment = document.querySelector("${SUBMIT_COMMENT}");
                            submit_comment.click();
                            console.log('submitted comment')
                            await sleep(2000);
                        }
                    }
                    let back_arrow = document.querySelector('a[href="/${this.current_user}/feed/"]');
         
                    if(back_arrow) {
                        back_arrow.click();
                    }
                    await sleep(3000);
                    
                }
            }

            send_comments();
            
        `);
    } 
    /*
    @info: check if the user has the actions blocked, if yes the profile is blocked for 6hrs
    */
    async check_actions_blocked() {
       
            let now = Date.now();
            let ore_da_aspettare = 6;
            if (this.blocked_actions) {
                if (!(this.blocked_actions_time + ore_da_aspettare * 60 * 60 * 1000 > now)) {
                    this.blocked_actions = false;
                    this.PROFILE['blocked_actions_time'] = this.blocked_actions_time = 0;
                    write_file(this.PROFILE_FL, JSON.stringify(this.PROFILE));
                    return;
                }
              
                return;
            }

            let block = await this.account_window.webContents.executeJavaScript(
                `document.querySelector("${BLOCKED_ACTIONS}") ? true : null`
            );

            if (block) {
                this.blocked_actions = true;
                show_popup(this.profile_name, 'actions block', this.avatar, `the actions are blocked, will try again in 6Hrs, meanwhile i'll continue To post medias ( if enabled )`);
                this.add_log("error", `PROFILE:  ${this.profile_name}  Has the actions blocked, will try again in 6Hrs, meanwhile i'll continue To post medias ( if enabled )`);
                this.PROFILE['blocked_actions_time'] = this.blocked_actions_time = now;
                write_file(this.PROFILE_FL, JSON.stringify(this.PROFILE));
            } else {
                this.blocked_actions = false;
            }

           
            return;
  

    }
    /*
    @info: left the follow based on the profile settings
    */
    async follow_action() {
           
        if (this.blocked_actions) {
            return;
        }

        let follow = (this.random_actions === true) ? randomRange(0, 1) : 1;
        if (!follow || this.STATS[this.day]['follow'] > this.max_follow) {
            this.add_log('info', `Not following user`);
            return;
        }

        this.add_log('info', `Following user`);
        await this.define_sleep();
        await this.account_window.webContents.executeJavaScript(`
		
			async function follow() {

				let close_post_button = document.querySelector("${CLOSE_POST_BUTTON}");
				if (close_post_button) {close_post_button.click();}

				let follow_button = document.querySelector("${FOLLOW_BUTTON}");

				if (!follow_button){
					follow_button = document.querySelector("${FOLLOW_BUTTON_1}")
					if (follow_button) follow_button.click()
				} else{
					follow_button.click()
				} 

				await sleep(1000);
			}

			follow();
		`);

        this.STATS[this.day]['follow'] ++;

        this.PROFILE['followed_range'] = this.PROFILE['followed_range'] + 1;
        write_file(this.PROFILE_FL, JSON.stringify(this.PROFILE));
        ProfilesDatas[this.profile_name]["toUnfollow"].push(this.current_user);
        write_file(this.TO_UNFOLLOW_FL, JSON.stringify(ProfilesDatas[this.profile_name]["toUnfollow"]));

       
        return;
      
    }
    /*
    @info: get the profile num_posts, num_followers, num_following
    @return: array with the stats [num_posts, num_followers, num_following]
    */
    profile_stats() {
            return this.account_window.webContents.executeJavaScript(`
			let stats_divs = document.querySelectorAll('${PROFILE_STATS}');
			let stats = [stats_divs[${STAT_POSTS}].textContent, stats_divs[${STAT_FOLLOWERS}].textContent, stats_divs[${STAT_FOLLOWING}].textContent];
			stats
		`);
        }
    /*
    @page: string
    @info: collect the loaded profiles in the following list of the given profile
    @return: array with the collected profiles
    @ps: the bot should yet be on the profile
    */
    collect_following(page) {
        return this.account_window.webContents.executeJavaScript(`

			async function collect_following(){
				await sleep(1000);
				let following_list = document.querySelector('a[href="/${page}/following/"]');
				following_list.click();
				await sleep(1000);

				//let to_get_height = document.querySelector("${FOLLOWING_PROFILES_LIST_TO_GET_HEIGHT}");
				//while (!to_get_height) {
				//	to_get_height = document.querySelector("${FOLLOWING_PROFILES_LIST_TO_GET_HEIGHT}");
				//	await sleep(500);
				//}

				//let height_scroll;

				timer = false;
				setTimeout(() => {timer = true;}, ${this.collectFollowingDelay} * 1000);

				while (!timer) {
				//	height_scroll = to_get_height.getBoundingClientRect().height;
				await sleep(500);
				//	window.scrollTo(0, height_scroll);
				}

				names_text = []

				names = document.querySelectorAll(".${UNFOLLOW_NAME_DIV}");
				names.forEach((name) => {
					names_text.push(name.textContent);
				})
				return names_text;

			}
			collect_following();
		`);
        }
        /*
        @page: string
        @info: collect the loaded profiles in the followers list of the given profile
        @return: array with the collected profiles
        @ps: the bot should yet be on the profile
        */
    collect_followers(page) {
        return this.account_window.webContents.executeJavaScript(`
			async function collect_followers(){
				await sleep(1000);
				let followers_list = document.querySelector('a[href="/${page}/followers/"]');
				followers_list.click();
				await sleep(1000);

				//let to_get_height = document.querySelector("${FOLLOWING_PROFILES_LIST_TO_GET_HEIGHT}");
				//while (!to_get_height) {
				//	to_get_height = document.querySelector("${FOLLOWING_PROFILES_LIST_TO_GET_HEIGHT}");
				//	await sleep(500);
				//}
				//let height_scroll;

				timer = false;
				setTimeout(() => {timer = true;}, ${this.collectToFollowDelay} * 1000);

				while (!timer) {
				//	height_scroll = to_get_height.getBoundingClientRect().height;
					await sleep(500);
				//	window.scrollTo(0, height_scroll);
				}

				names_text = []

				names = document.querySelectorAll(".${UNFOLLOW_NAME_DIV}");
				names.forEach((name) => {
					names_text.push(name.textContent);
				})
				return names_text;
			}
			collect_followers();
		`);
    }

    /*
    @info: start the task for collect the profiles to follow from the given pages
    */
    async collect_profiles() {
        for (var i = 0; i < this.collectProfilesPages.length; i++) {
            let page = this.collectProfilesPages[i];
            await this.visit_user(page);
            await this.define_sleep();
            let profile_type = await this.check_user_type();
            if (profile_type == 'private') continue;
            let profiles_collected = await this.collect_followers(page);
            ProfilesDatas[this.profile_name]["toFollow"] =
                ProfilesDatas[this.profile_name]["toFollow"].concat(profiles_collected);
            write_file(this.TO_FOLLOW_FL, JSON.stringify(ProfilesDatas[this.profile_name]["toFollow"]));
        }
    
        return;
    }
    /*
    @user: string
    @info: unfollow the given user
    @ps: the bot when call this is already in the following list of the personal profile
    */
    async unfollow_action(user) {
   
        if (this.blocked_actions) {
       
            return;
        }
        if (!(this.unfollow && this.followedRange >= this.startUnfollow)) {
       
            return;
        }

        let unfollow = (this.unfollow) ? ((this.random_actions === true) ? randomRange(0, 1) : 1) : 0;

        if (!unfollow || this.STATS[this.day]['unfollow'] > this.max_unfollow) {
            this.add_log('info', `Not unfollowing`);
            return;
        }

        await this.visit_user(this.username);
        await this.define_sleep();
        let following_profiles = await this.collect_following(this.username)
            .catch(e => {
                this.add_log('error', `Profiles to unfollowCollector: Error : ${e}. Probably caused from wrong username in the settings`);
            });
        if (!following_profiles) {
        
            return;
        }
        let to_unfollow = ProfilesDatas[this.profile_name]["toUnfollow"];

        for (let i = 1; i <= following_profiles.length; i++) {

            let following_user = following_profiles[following_profiles.length - i];
            if (to_unfollow.includes(following_user)) {
                this.add_log('info', `Unfollowing ${following_user}`);

                await this.account_window.webContents.executeJavaScript(`
					async function unfollow(){
						await sleep(1000);
						let xpath = "//div[contains(concat(' ',@class,' '), '${UNFOLLOW_NAME_DIV}') and contains(., '${following_user}')]";
						let name_div = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
						let parent_div = name_div.parentElement.parentElement.parentElement;
						let unfollow_button = parent_div.querySelector("${UNFOLLOW_BUTTON}");

						unfollow_button.click();

						await sleep(1000);

						let confirm_unfollow = document.querySelector("${CONFIRM_UNFOLLOW_BUTTON}");
						confirm_unfollow.click();
					}

					unfollow()
				`)
                    .then(r => {
                        this.STATS[this.day]['unfollow'] ++;
                        this.PROFILE['followed_range'] = this.PROFILE['followed_range'] - 1;

                        to_unfollow.remove(following_user);
                        write_file(this.TO_UNFOLLOW_FL, JSON.stringify(to_unfollow));
                        write_file(this.PROFILE_FL, JSON.stringify(this.PROFILE));
                    })
                    .catch(e => {
                        this.add_log('error', `Error: ${e}`);
                    });

                break
            }
        }
    }

    /*
    @info: method needed for generate the tag to insert in the post to upload
    */
    generateUsertagFromName(name, x, y) {
        return new Promise(async resolve => {
            // constrain x and y to 0..1 (0 and 1 are not supported)
            x = clamp(x, 0.0001, 0.9999);
            y = clamp(y, 0.0001, 0.9999);
            // get the user_id (pk) for the name
            const { pk } = await this.ig.user.searchExact(name)
                .catch(e => {
                    this.add_log('error', 'Error building tag for user: ' + name + '. ERROR: ' + e);
                    return { pk: null };
                })
            if (!pk) {
                resolve(null);
                return;
            }
            resolve({
                user_id: pk,
                position: [x, y],
            });
            return;
        });
    }

    /*
    @info: collect the images through the bot
    */
    async collect_images_inFlow() {

        let now = Date.now();
        if (!this.collectImages === true || !(this.collectImagesLastTime == 0 || this.collectImagesLastTime + this.collectImagesDelay < now)) {
           
            return;
        }

        await images_collector(this.profile_name, this.hashtags);

        this.PROFILE['collect_images_last_time'] = this.collectImagesLastTime = now;
        write_file(this.PROFILE_FL, JSON.stringify(this.PROFILE));
     
    }

    /*
    @path: string
    @info: get the directories inside the given path
    @return: array of strings ( the found directories )
    */
    get_directories(path) {
            return fs.readdirSync(path, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name)
        }
    /*
    @path: string
    @info: get the files inside the given path
    @return: array of strings ( the found files )
    */
    get_files(path) {
            return fs.readdirSync(path, { withFileTypes: true })
                .filter(dirent => dirent.isFile())
                .map(dirent => __dirname + '/../../' + path + '/' + dirent.name);
        }
    /*
    @obj: object ( contains the stored scheduled posts/stories )
    @type_: string ( story or post )
    @return: array of arrays
    	- if type post:
    		[[post.file.path: string, post.file.type: string, post.tags: array, this.captionsToUse[post.caption]: string], ... ]

    		this.captionsToUse --> array that stores the captions of the scheduled posts
    		post.caption --> index of the caption in the array

    	- if type story:
    		[[post.file.path: string, post.file.type: string], [post.file.path, post.file.type], ...]
    */
    get_files_to_upload(obj, type_) {
      
        let now = Date.now();
        let times = Object.keys(obj).sort((a, b) => { return a - b; });
        let to_return = [];
        let previous_time;

        for (let i = 0; i < times.length; i++) {
            let time = times[i];
            
            let post_obbligati = times.length == 1 && time < now; // se ci sta solo un tempo passato i post sono quelli del tempo in analisi per forza
            if (time < now && !post_obbligati) {
                if (previous_time) {
                    for (let i = 0; i < obj[previous_time].length; i++) {
                        let post = obj[previous_time][i];
                        let file = post.file.path;
                        if (!file.startsWith('/')) {
                            remove_file_from_used_list(this.profile_name, post.file.code);
                        }
                    }
                    delete obj[previous_time]
                }
                previous_time = time;
                continue;
            } else {

                if ((!previous_time || !(previous_time < now)) && !post_obbligati) {
                    
                    return to_return;
                } else {
                    if (post_obbligati) previous_time = time;
                    let posts = obj[previous_time];

                    if (posts.length == 0) {
                        delete obj[previous_time];
                        
                        return to_return;
                    }
                    for (let i = 0; i < posts.length; i++) {
                        let post = posts[i];

                        if (type_ == "story") {
                            to_return.push([post.file.code, post.file.hashtag, replaceAllChars(post.file.path.trim(), "%20", " "), post.file.type]);
                            i == posts.length - 1 ? delete this.scheduledStories[previous_time] : null;
                        } else if (type_ == "post") {
                            to_return.push([post.file.code, post.file.hashtag, replaceAllChars(post.file.path.trim(), "%20", " "), post.file.type, post.tags, this.captionsToUse[post.caption]]);
                            i == posts.length - 1 ? delete this.scheduledPosts[previous_time] : null;
                        }
                        // await this.upload_media_post_api(upload, file_type, post_tags, caption);

                    }
                    write_file(this.PROFILE_FL, JSON.stringify(this.PROFILE));
                }
            }
        }
     
        return to_return;
    }

    /*
    @upload: string ( the link soure of a media )
    @type: string ( the media type: image/video)
    @hashtag: string ( the selected media file path .../hashtag.txt, .../@profile.txt )
    @return: 
    	- true: if the file is correctly downloaded
    	- null: if some errors happen
    */
    async downloadController(code, upload, type, hashtag) {
        if (type == "video") {
            let videourl = await download(code, upload, type, this.UPLOAD_VD_PATH, hashtag);
            console.log("Downloaded: ", videourl)
            if (!videourl) {
                remove_file_from_hashtag(code, type, hashtag);
                return null;
            }
            console.log("creating poster")
            await createPoster(videourl, this.UPLOAD_IMG_PATH);
        } else {
            let imgurl = await download(code, upload, type, this.UPLOAD_IMG_PATH, hashtag);
            if (!imgurl) {
                remove_file_from_hashtag(code, type, hashtag);
                return null
            }
        }
        return true;
    }
    /*
    @info: 
    	- if auto upload get one of the stored medias
    	- else check the scheduled posts
    	- upload the file through the api
    */
    async upload_image() {
           

        if (!(this.autoPost === true)) {
    
            return;
        }

        let now = Date.now();
        let upload;
        let file_type;
        let caption;
        let owner;
        let code;
        let random_hashtag;
        let post_tags = [];

        await this.define_sleep();


        if (this.randomPost === true) {
            if (!(this.randomPostLastTime == 0 || this.randomPostLastTime + this.randomPostDelay < now)) {
          
                return;
            }
            let valid;
            do {
                [code, upload, file_type, owner, caption, random_hashtag] = random_file_to_upload(this.profile_name, this.hashtags);

                if (!upload) {
                    this.add_log('error', `Media for random post not found collect other images please`);
                    this.PROFILE['random_post_last_time'] = this.randomPostLastTime = now;
                    write_file(this.PROFILE_FL, JSON.stringify(this.PROFILE));
                  
                    return;
                }
                if (random_hashtag.startsWith("!")) {
                    if (file_type == "video") {
                        await copyFile(upload, this.UPLOAD_VD_PATH);
                        await createPoster(upload, this.UPLOAD_IMG_PATH);
                    } else if (file_type == "image") {
                        await copyFile(upload, this.UPLOAD_IMG_PATH);
                    }
                    valid = true;
                } else {
                    valid = await this.downloadController(code, upload, file_type, random_hashtag);
                }

            } while (!valid);

            caption = this.captions[randomRange(0, this.captions.length - 1)];
            if (caption && caption.includes("@owner")) caption = caption.replace("@owner", "@" + owner);
            post_tags.push(owner);

            add_file_to_used_list(this.profile_name, upload);
            await this.upload_media_post_api(
                this.UPLOAD_VD_PATH,
                this.UPLOAD_IMG_PATH,
                upload,
                file_type,
                post_tags,
                caption
            );
        } else {
            let to_upload = this.get_files_to_upload(this.scheduledPosts, "post");
            
            for (let i = 0; i < to_upload.length; i++) {
                let image_path, video_path;
                let hashtag;
                let valid;
                [code, hashtag, upload, file_type, post_tags, caption] = to_upload[i];
                if (!upload) {
                    return;
                }

                if (!upload.startsWith("http")) {
                    if (file_type == "video") {
                        await copyFile(upload, this.UPLOAD_VD_PATH);
                        await createPoster(upload, this.UPLOAD_IMG_PATH);
                    } else if (file_type == "image") {
                        await copyFile(upload, this.UPLOAD_IMG_PATH);
                    }
                    valid = true;
                } else {
                    valid = await this.downloadController(code, upload, file_type, hashtag);
                }
                if(!valid){
                    this.add_log('error', `Error in uploading post: ` + upload);
                    return;
                }
                await this.upload_media_post_api(
                    this.UPLOAD_VD_PATH,
                    this.UPLOAD_IMG_PATH,
                    upload,
                    file_type,
                    post_tags,
                    caption
                );
            }
        }
        this.PROFILE['random_post_last_time'] = this.randomPostLastTime = now;
        write_file(this.PROFILE_FL, JSON.stringify(this.PROFILE));
     
        return;
    }
    /*
    @video_path: string ( path to the video to upload .mp4)
    @image_path: string ( path to the cover of the video .jpg)
    @upload: string ( the link of the file source [if random media] the path to the file source [ if scheduled media ])
    @file_type: string ( the type of the story: video/image)
    @post_tags: array of strings ( the tags to use in the post )
    @use_caption: string ( the caption to use in the post )
    @info: upload a story through the api
    */
    async upload_media_post_api(video_path, image_path, upload, file_type, post_tags, use_caption) {

        console.log("uploading", video_path, image_path, upload, file_type, post_tags, use_caption);

        let user_tags = { in: [] };
        try {
            for (let i = 0; i < post_tags.length; i++) {
                let user_to_tag = post_tags[i]
                let tag;
                await this.generateUsertagFromName(user_to_tag, 0.5, 0.5)
                    .then(res => { tag = res; })
                    .catch(e => { throw new Error({ 'CouldNotCreateUserTag': ` ${user_to_tag}: ${e}` }) });
                if (!tag) continue;
                user_tags['in'].push(tag);
            }
        } catch (e) {
            show_popup(this.profile_name, 'publication error', this.avatar, 'Could not publish the post with its tags, some errors occured');
            
            this.add_log('error', `Error in building users tags ${e}`);

        }
        let sticker;
        // try {
        // 	sticker = new StickerBuilder()
        // 	.add(StickerBuilder.hashtag({ tagName: user_to_tag }).center())
        // 	.build()
        // } catch(e) {
        // 	console.log('ERROR IN BUILDING STICKER TAG', e)
        // }
        if (file_type == "video") {

            let video = await readFileAsync(video_path);
            let cover = await readFileAsync(image_path);

            const publishResult = await this.ig.publish.video({
                    // read the file into a Buffer
                    video: video,
                    coverImage: cover,
                    caption: use_caption,
                    usertags: user_tags
                })
                .then(res => {
                    this.add_log('success', `Uploaded Post image ${upload}`);
                    console.log(res);
                    return res;
                })
                .catch(err => {
                    show_popup(this.profile_name, 'publication error', this.avatar, "Could not publish the post video: " + upload);
                    
                    this.add_log('error', `Erro Post video: ${err}`);
                });
            console.log(publishResult);

        } else if (file_type == "image") {

            let photo = await readFileAsync(image_path);

            const publishResult = await this.ig.publish.photo({
                    file: photo,
                    caption: use_caption,
                    usertags: user_tags
                })
                .then(res => {
                    this.add_log('success', `Uploaded Post image ${upload}`);
                    console.log(res);
                    return res;
                })
                .catch(err => {
                    show_popup(this.profile_name, 'publication error', this.avatar, "Could not publish the post image: " + upload);
                    this.add_log('error', `Erro Post Image: ${err}`);
                });
        }

        await sleep(10000);
        return;

    }

    /*
    @info: 
        - if auto upload get one of the stored medias
        - else check the scheduled stories
        - upload the file through the api
    */
    async upload_story() {
            
        let now = Date.now();
        let owner;
        let upload;
        let file_type;
        let caption;
        let code;
        let random_hashtag;

        if (!(this.autoStory === true)) {
            
            return;
        }

        await this.define_sleep();

        if (this.randomStory === true) {
            if (!(this.randomStoryLastTime == 0 || this.randomStoryLastTime + this.randomStoryDelay < now)) {
            
                return;
            }
            let valid;
            do {
                [code, upload, file_type, owner, caption, random_hashtag] = random_file_to_upload(this.profile_name, this.hashtags);


                if (!upload) {
                    this.add_log('error', `Media for random story not found collect other images please`);
                    this.PROFILE['random_story_last_time'] = this.randomStoryLastTime = now;
                    write_file(this.PROFILE_FL, JSON.stringify(this.PROFILE));
               
                    return;
                }
                if (random_hashtag.startsWith("!")) {
                    if (file_type == "video") {
                        await copyFile(upload, this.UPLOAD_VD_PATH);
                        await createPoster(upload, this.UPLOAD_IMG_PATH);
                    } else if (file_type == "image") {
                        await copyFile(upload, this.UPLOAD_IMG_PATH);
                    }
                    valid = true;
                } else {
                    valid = await this.downloadController(code, upload, file_type, random_hashtag);
                }

            } while (!valid);

            add_file_to_used_list(this.profile_name, upload);

            await this.upload_media_story_api(
                this.UPLOAD_VD_PATH,
                this.UPLOAD_IMG_PATH,
                upload,
                file_type
            );

        } else {
            let to_upload = this.get_files_to_upload(this.scheduledStories, "story");
           
            for (let i = 0; i < to_upload.length; i++) {
                let hashtag;
                let valid;
                [code, hashtag, upload, file_type] = to_upload[i];
                if (!upload) {
                    return;
                }

                if (!upload.startsWith("http")) {
                    if (file_type == "video") {
                        await copyFile(upload, this.UPLOAD_VD_PATH);
                        await createPoster(upload, this.UPLOAD_IMG_PATH);
                    } else if (file_type == "image") {
                        await copyFile(upload, this.UPLOAD_IMG_PATH);
                    }
                    valid = true;
                } else {
                    valid = await this.downloadController(code, upload, file_type, hashtag);
                }
                if(!valid){
                    this.add_log('error', `Error in uploading story: ` + upload);
                    return;
                }
                await this.upload_media_story_api(
                    this.UPLOAD_VD_PATH,
                    this.UPLOAD_IMG_PATH,
                    upload,
                    file_type
                );
            }
        }


        this.PROFILE['random_story_last_time'] = this.randomStoryLastTime = now;
        write_file(this.PROFILE_FL, JSON.stringify(this.PROFILE));

        await sleep(10000);
        
        return;
     
    }
    /*
    @video_path: string ( path to the video to upload .mp4)
    @image_path: string ( path to the cover of the video .jpg)
    @upload: string ( the link of the file source [if random media] the path to the file source [ if scheduled media ])
    @file_type: string ( the type of the story: video/image)
    @info: upload a story through the api
    */
    async upload_media_story_api(video_path, image_path, upload, file_type) {
        console.log("uploading", video_path, image_path, upload, file_type);
        let sticker;
        // try {
        //  sticker = new StickerBuilder()
        //  .add(StickerBuilder.hashtag({ tagName: user_to_tag }).center())
        //  .build()
        // } catch(e) {
        //  console.log('ERROR IN BUILDING STICKER TAG', e)
        // }
        
        if (file_type == "video") {
            if (!exists_file(video_path)) {
                this.add_log("error", "could not open the given path: " + video_path);
             
                return;
            }

            let video = await readFileAsync(video_path);
            let cover = await readFileAsync(image_path);

            const publishResult = await this.ig.publish.story({
                    video,
                    coverImage: cover,
                    stickerConfig: sticker,
                })
                .then(res => { this.add_log('success', `Uploaded Story video ${upload}`); return res; })
                .catch(err => {
                    this.add_log('error', `Erro story video: ${err}`);
                    show_popup(this.profile_name, 'publication error', this.avatar, "Could not publish the story video");
                });

        } else if (file_type == "image") {
            if (!exists_file(image_path)) {
                this.add_log("error", "could not open the given path: " + image_path);
             
                return;
            }

            let photo = await readFileAsync(image_path);
            const publishResult = await this.ig.publish.story({
                    file: photo,
                    stickerConfig: sticker,
                })
                .then(res => { this.add_log('success', `Uploaded Story image ${upload}`); return res; })
                .catch(err => {
                    this.add_log('error', `Erro story image: ${err}`);
                    show_popup(this.profile_name, 'publication error', this.avatar, "Could not publish the story image");
                });

        }

        await sleep(10000);
        
        return;
      
    }

    /*
    @info: define the sleep function in the current window
    */
    define_sleep() {
        if (!this.account_window) return;
        return this.account_window.webContents.executeJavaScript(`
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
        `)
    }

    async auto_dm(user){

        if(!this.leftMessage) return;
        if(this.STATS[this.day]['messages'] > this.max_messages) return;
        let send_dm = (this.random_actions === true) ? randomRange(0, 1) : 1;
        if(!send_dm) return;

        await this.open_dm_page();
        await this.go_to_dm(user);
        let message = this.messageText[randomRange(0, this.messageText.length - 1)];
        await this.write_dm(message);
        await this.send_dm();
        this.STATS[this.day]['messages'] ++;
    }

    async open_dm_page(){
        this.account_window.loadURL(INSTAGRAM_DM);
        await this.define_sleep();
        await this.account_window.webContents.executeJavaScript(`
            sleep(1000);
            let popup = document.querySelector("${POPUP_DM_PAGE}"); //<
            if(popup) popup.click()
        `);
    }

    async go_to_dm(user){

        let found_button = await this.account_window.webContents.executeJavaScript(`
            ( async () => {

                await sleep(1000);
                let found = true;
                let find_search_button = document.querySelector("${SEARCH_BUTTON_DM_PAGE}"); //<
                if(find_search_button) find_search_button.click();
                else found = false;
                return found; 

            })();
        `).then(res => {
            this.add_log('success', `search button clicked in dm page`);
            return res;
        })
        .catch(err => {
            this.add_log('error', `Error in clicking button in dm page: ${err}`);
            return false;
        });

        if(!found_button){
            this.add_log("error", "could not click the search button in the dm page");
            return false;
        };

        let opened_chat = await this.account_window.webContents.executeJavaScript(`

            
            ( async () => {

            await sleep(1000);

            // ---- SEARCH USER ----
            const setValue = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                "value"
            ).set;
            const modifyInput = (name, value) => {
                const input = document.getElementsByName(name)[0];
                setValue.call(input, value);
                input.dispatchEvent(new Event('input', { bubbles: true}));
            }

            modifyInput('${SEARCH_TEXT_FIELD_NAME}', '${user}');


            // ---- WAIT USER SEARCH QUERY TO END ( MAX: 10 SEC ) ----
            let timeout = 10;
            let loaded_users = document.querySelector("${FOUND_USER}"); //<
            while(!loaded_users && timeout > 0){
                loaded_users = document.querySelector("${FOUND_USER}"); //<
                await sleep(1000);
                timeout --;
                console.log(timeout);
            }
            if( timeout <= 0 ) return false;


            // ---- CLICK THE FIRST USER FOUND ----
            let user = document.querySelector("${FOUND_USER}"); //<
            if(user) user.click();
            else return false;


            // ---- OPEN THE CHAT ----
            let open_chat = document.querySelector("${OPEN_CHAT_BUTTON}"); //<
            if(open_chat) open_chat.click();
            else return false;

            

            return true;

            } )();
        `).then(res => {
            this.add_log('success', `opened dm chat: ${user}`);
            return res;
        })
        .catch(err => {
            this.add_log('error', `Error opening dm chat: ${user}, ERR:${err}`);
            return false;
        });

        if(!opened_chat){
            this.add_log("error", "could not open the dm of the given user");
            return false;
        };                              

    }

    async write_dm(message){
        let wrote = await this.account_window.webContents.executeJavaScript(`
            
            ( async () => {

            await sleep(5000);

            // ---- SEARCH USER ----
            const set_comment = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
            const write_dm = (selector, value) => {
                const textarea = document.querySelector(selector);
                set_comment.call(textarea, value);
                textarea.dispatchEvent(new Event('input', { bubbles: true}));
            }

            let selector = 'textarea';
            if(!document.querySelector(selector)) return false;
            write_dm(selector, "${message}");
            return true;

            } )();
        `).then(res => {
            this.add_log('success', `wrote dm: ${message}`);
            return res;
        })
        .catch(err => {
            this.add_log('error', `Error writing dm: ${message}, ERR: ${err}`);
            return false;
        });

        if(!wrote){
            this.add_log("error", "could not wrote the given dm");
            return false;
        };     
    }

    async send_dm(){

        let submit = await this.account_window.webContents.executeJavaScript(`
            ( async () => {
                await sleep(1000);
                let send = document.querySelector("${SUBMIT_BUTTON_DM}");
                if(!send) return false;
                else{
                    send.click();
                    return true;
                }

            })();
        `).then(res => {
            this.add_log('success', `dm sent`);
            return res;
        })
        .catch(err => {
            this.add_log('error', `Error sending dm: ${err}`);
            return false;
        });

        if(!submit){
            this.add_log("error", "could not send the dm");
            return false;
        };
    }

    /*
    @user: string ( the username of the profile )
    @info: manage the interaction with the profiles and the medias upload.
    @ps: recursive function, the main body of the bot.
    */
    async interact_with(users) {
        let interact = true,
            start_time = Date.now();

        if (!this.account_window || this.account_window.isDestroyed()) {
            // console.log(this, this.account_window, !this.account_window);
            if (this.account_window) console.log(this.account_window.isDestroyed());
            this.add_log('error', `Window: ${this.account_window ? true: false}, Breaking interactions. Bot is closed`);
            //show_popup(this.profile_name, 'error', this.avatar, "please restart the bot");
            return;
        }

        // Check if there are no more users to pick to interack with
        if (users <= 1) {
            await this.collect_profiles();
            this.profiles = ProfilesDatas[this.profile_name]["toFollow"];
            this.interact_with(this.profiles);
            return;
        }

        if( ((this.leftMessage && this.STATS[this.day]['messages'] > this.max_messages) || !this.leftMessage) &&
            ((this.leftLike && this.STATS[this.day]['comments'] > this.max_comments) || !this.leftLike) &&
            ((this.leftComment && this.STATS[this.day]['likes'] > this.max_likes ) || !this.leftComment) &&
            ((this.unfollow && this.STATS[this.day]['unfollow'] > this.max_unfollow) || !this.unfollow) &&
            (((this.followNoPost || this.followPrivate || this.followPublic) && this.STATS[this.day]['follow'] > this.max_follow) || !(this.followNoPost || this.followPrivate || this.followPublic)) 
        ) {
            interact = false;
            this.add_log('warning', `All interactions have reached the limits, I'll keep posting medias ( if enabled )`);
            show_popup(this.profile_name, 'interactions limit', this.avatar, "reached tha maximum actions for the day, i'll continue to post medias ( if enabled ) ");
        }
        
        // Check if actions blocked
        await this.check_actions_blocked();
        if (this.blocked_actions) {
            interact = false;
        }
        // Doing default actions
        try {
            await this.upload_image();
        } catch (e) {
            this.add_log('error', `Error uploading post: ${e}`);
        }
        try {
            await this.upload_story();
        } catch (e) {
            this.add_log('error', `Error uploading story: ${e}`);
        }

        try {
            if(this.focusInFlow) await this.focus_comment_action();
        } catch(e) {
            this.add_log('error', `Error doing the focus comments action on the given post: ${e}`);
        }

        try {
            await this.collect_images_inFlow().catch(e => this.add_log('error', `Error collecting images: ${e}`))
        } catch (e) {
            this.add_log('error', `Error collecting images: ${e}`);
        }

        // Picking new user
        this.current_user = users.shift();
        this.add_log('success', `INTERACTIONS: ${this.current_user}`);
        if (!this.current_user) {
            interact = false;
        }

        // if have to interact it starts the interactions
        if (interact) {

            this.STATS[this.day]['visited'] ++;
            write_file(this.TO_FOLLOW_FL, JSON.stringify(this.profiles));

            try {
                await this.visit_user(this.current_user);
            } catch (e) {
                this.add_log('error', `Error loading user page: ${e}`);
                this.interact_with(users);
                return;
            }

            await this.define_sleep();
            let profile_type = await this.check_user_type()
            if (profile_type == 'private') {
                this.STATS[this.day]['private'] ++;
            } else if (profile_type == 'noPost') {
                this.STATS[this.day]['noPost'] ++;
            } else if (profile_type == 'public') {
                try {
                    await this.list_posts();

                    await this.likes_action();
                    await this.check_actions_blocked();

                    await this.comments_action();
                    await this.check_actions_blocked();
                } catch (e) {
                    this.add_log('error', `Error lefting interactions: ${e}`);
                }
            }

            if ((profile_type == 'public' && this.followPublic) ||
                (profile_type == 'private' && this.followPrivate) ||
                (profile_type == 'noPosts' && this.followNoPost)
            ) {
                try {
                    await this.follow_action();
                    await this.check_actions_blocked();
                } catch (e) {
                    this.add_log('error', `Error follow action: ${e}`);
                }

                try {
                    await this.unfollow_action();
                    await this.check_actions_blocked();
                } catch (e) {
                    this.add_log('error', `Error unfollow action: ${e}`);
                }
                try {
                    await this.auto_dm(this.current_user);
                } catch (e) {
                    this.add_log('error', `Error dm action: ${e}`);
                }
                
            } else {
                this.interact_with(users);
                return;
            }
        } else {
            users.unshift(this.current_user);
        }

        await this.visit_user(this.username);
        write_file(this.STATS_FL, JSON.stringify(this.STATS));
        let end_time = Date.now();
        let process_time = (end_time - start_time) / 1000;
        if (process_time < this.delay) {
            let time_to_sleep;

            if (this.random_time === true) time_to_sleep = randomRange(Math.round(this.delay / 2), this.delay * 2);
            else time_to_sleep = this.delay;
            this.add_log('warning', `SLEEPING: ${time_to_sleep} seconds`);
            await sleep(time_to_sleep * 1000);
        }

        this.interact_with(users);

    }

    /*
    @info: close the electron window
    */
    close() {
        if (!this.is_open()) return;
        this.status = false;
        this.account_window.close();
        this.account_window = null;
    }
    /*
    @info: check if the elctron window is opened
    @return: 
    	- true: the window is open
    	- null: the window is closed
    */
    is_open() {
        return this.status;
    }

    /*
    @info: load the profile stats and save them
    */
    async collect_profile_stats() {
        await this.visit_user(this.username);
        let prof_stats = await this.profile_stats();
        this.STATS[this.day]['posts'] = parseInt(prof_stats[STAT_POSTS].replace('.', ''));
        this.STATS[this.day]['following'] = parseInt(prof_stats[STAT_FOLLOWING].replace('.', ''));
        this.STATS[this.day]['followers'] = parseInt(prof_stats[STAT_FOLLOWERS].replace('.', ''));
        write_file(this.STATS_FL, JSON.stringify(this.STATS));
    }

    /*
    @info: does the login and collect the profile stats
    @return:
    	true
    */
    async setup() {
        this.profiles = []
        this.status = true;
        await this.login();
        await this.collect_profile_stats();
        return true;
    }
        /*
        @info: start the bot and start the interactions
        */
    async run() {
        let status = await this.setup();
        if (!status) return;
        this.profiles = ProfilesDatas[this.profile_name]["toFollow"];
        this.interact_with(this.profiles);
    }

}
