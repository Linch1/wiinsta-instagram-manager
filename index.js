const remote        = require('electron'),
      app           = remote.app,
      BrowserWindow = remote.BrowserWindow,
      fs            = require('fs'),
      mkdirp        = require('mkdirp'),
      ejse          = require('ejs-electron'),
      setupEvents   = require('./installers/setupEvents');

const path = require('path');

let win;

//handle setupevents as quickly as possible
if (setupEvents.handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
 }

datas = {
  "LOGIN DATAS": 
  {
      "type": "block"
  },
  "username":
    {
      "type": "t",
      "description": "your login username"
    },
  "password":
    {
      "type": "t",
      "description": "your login password"
    },
  "profile_image":
    {
      "type": "nr"
    },
  "profile_avatar":
    {
      "type": "nr"
    },
  "today_followers":
    {
      "type": "nr"
    },
  "today_following":
    {
      "type": "nr"
    },
  "blocked_actions_time":
    {
      "type": "nr",
      "description": "your login password"
    },
  "session_id":
    {
      "type": "nr",
      "description": "the current session id"
    },
  "INTERACTIONS": 
  {
      "type": "block"
  },
  "follow_public":
    {
      "type": "c",
      "description": "check if you want to follow public accounts"
    },
  "follow_private":
    {
      "type": "c",
      "description": "check if you want to follow private accounts"
    },
  "follow_noPost":
    {
      "type": "c",
      "description": "check if you want to follow accounts without posts"
    },
  "left_comment":
    {
      "type": "c",
      "description": "check if you want to left comments under posts"
    },
  "left_like":
    {
      "type": "c",
      "description": "check if you want to left likes under posts"
    },
  "unfollow":
    {
      "type": "c",
      "description": "check if you want to unfollow"
    },
  "INTERACTIONS VALUES": 
    {
        "type": "block"
    },
  "number_of_likes":
    {
      "type": "n",
      "description": "the number of likes that you want to left on each account"
    },
  "pages_for_porifle_collection":
    {
      "type": "at",
      "description": "The pages from where the bot collects the profiles to interact with (have to be public or followed by your profile)"
    },
  "number_of_comments":
    {
      "type": "n",
      "description": "the number of comments that you want to left on each account"
    },
  "comment":
    {
      "type": "at",
      "description": "comments that you want to left ( each comment is separate by '&' char ex: nice pic & wow amazin post & ecc..)"
    },
  
  "delay":
    {
      "type": "n",
      "description": "the delay that the bot has to wait between two interactions cycles (seconds)"
    },
  "start_unfollow":
    {
      "type": "n",
      "description": `number of accounts to be followed before the bot start to do 
                      the unfollow action( the bot unfollows only the accountd that it have followed previously ).
                      Ex: if set to 50 this field, the bot will start to unfollow someone only once he has followed 50 profiles`
    },
  "random_actions":
    {
      "type": "c",
      "description": `check if you want to randomize the actions ( the current parameters are used as max range ) ex: if u said number of likes = 3 
                      the bot will put 1 to 3 likes. This prevent Instagram to find a pattern in the bot actions. For the follow and unfollow (if you activated them )
                      actions it will randomatically choice to left them or not`
    },
  "random_time":
    {
      "type": "c",
      "description": `check if you want to randomize the delay time between two interactions cycles. Based on the 'x' numbers of cycles that you want the the to
                      do in the given 'y' hours. `
    },
  "followed_range":
    {
      "type": "nr",
      "description": "it is a counter that keep trak of how many people the account has followed"
    },
 
  "collect_following_time":
    {
      "type": "n",
      "description": " the delay that the bot has for scrape your following list and find who unfollow(seconds)"
    },
  "collect_to_follow_time":
    {
      "type": "n",
      "description": " the delay that the bot has for collect the profiles with which interact (seconds)"
    },
  "INTERACTIONS LIMITS": 
    {
        "type": "block"
    },
  "follow_per_day":
    {
      "type": "n",
      "description": " the max number of follow actions per day "
    },
  "likes_per_day":
    {
      "type": "n",
      "description": "the max number of likes actions per day"
    },
  "unfollow_per_day":
    {
      "type": "n",
      "description": "the max number of unfollow actions per day"
    },
  "comment_per_day":
    {
      "type": "n",
      "description": "the max number of comments actions per day"
    },
  "IMAGES COLLECTOR": 
    {
        "type": "block"
    },
  "hashtags":
  {
    "type": "at",
    "description": "the hastags that the bot uses for collect images ( write each hashtag separate by '&' char ex: #photos &  @profile1 & #sunshine & @profile2 )"
  },
  "collect_images":
  {
    "type": "c",
    "description": "check if you want that the bott collects the most popular images from the given hashtags"
  },
  "collect_images_delay":
  {
    "type": "n",
    "description": "the delay between two images collections cicles ( in minutes -> 120 = 2 Hours)"
  },
  "collect_images_last_time":
  {
    "type": "nr",
    "description": " collect images parameter "
  },
  "AUTO POST": 
    {
        "type": "block"
    },
  "auto_post":
  {
    "type": "c",
    "description": " check if you want the bot to auto post, if u click the PLUS green symbol you can add a scheduled post "
  },
  "random_post":
  {
    "type": "c",
    "description": ` check if you want the bot to make a random post. he picks the images/videos from the files that he has 
                     previously collected. (works only if auto-post is activated)`
  },
  "random_post_delay":
  {
    "type": "n",
    "description": " delay between two random posts ( in minutes -> 120 = 2 Hours) "
  },
  "random_post_last_time":
  {
    "type": "nr",
    "description": " random post parameter "
  },
  "captions":
  {
    "type": "at",
    "render": "textarea",
    "description": " the captions that the bot uses for auto posts ( write each caption separate by '&' char )"
  },
  "captions_to_use":
  {
    "type": "nr",
    "default": "[]",
    "description": "The captions that have to be used for upcoming publish of scheduled post"
  },
  "scheduled_posts": 
    {
      "type": "di",
      "description": " schedule an auto post "
    },
  "AUTO STORY": 
    {
        "type": "block"
    },
  "scheduled_stories": 
  {
    "type": "di",
    "description": " schedule an auto story"
  },
  "auto_story":
    {
      "type": "c",
      "description": " check if you want the bot to do auto stories "
    },
  "random_story":
    {
      "type": "c",
      "description": "check if you want the bot to do random stories ( works only if auto-story is activated )"
    },
  "random_story_delay":
    {
      "type": "n",
      "description": "the delay between two random stories  ( in minutes -> 120 = 2 Hours)"
    },
  "random_story_last_time":
    {
      "type": "nr",
      "description": "random story param "
    }
}

var DatasPath = app.getPath('userData') + '/';
var folders = [
  DatasPath,
  DatasPath + 'datas', 
  DatasPath + 'datas/stats',
  DatasPath + 'datas/sessions', 
  DatasPath + 'datas/toFollow', 
  DatasPath + 'datas/toUnfollow', 
  DatasPath + 'datas/profiles', 
  DatasPath + 'datas/downloads', 
  DatasPath + 'datas/downloads/new', 
  DatasPath + 'datas/used',
  DatasPath + 'datas/logs',
  DatasPath + 'datas/upload'
]


for (let i = 0; i < folders.length; i++) {
  let folder = folders[i]
  if (!fs.existsSync(folder)){
      fs.mkdirSync(folder);
  }
}

console.log(DatasPath)
let common_object = {
  "session-id-counter":0,
  "last-notification-id": 0
}
let common_object_keys = Object.keys(common_object);

if (!fs.existsSync(DatasPath + 'datas/profiles.txt')){
    fs.writeFileSync(DatasPath + 'datas/profiles.txt', JSON.stringify(common_object), 'utf8');
} else {
  let profiles_obj = fs.readFileSync(DatasPath + 'datas/profiles.txt', 'utf-8');
  profiles_obj = JSON.parse(profiles_obj);
  for ([key, value] of Object.entries(common_object)){
    if(!profiles_obj[key]) profiles_obj[key] = value;
  }
  fs.writeFileSync(DatasPath + 'datas/profiles.txt', JSON.stringify(profiles_obj), 'utf8');
}

function createWindow () {
  // Create the browser window.
   win = new BrowserWindow({
    width: 1200,
    height: 750,
    frame: false,

    icon: 'icons/png/icon.png',
    webPreferences: {
      nodeIntegration: true,
    },
  });
  //win.webContents.openDevTools();
  win.loadFile('views/index/home.ejs', datas); // test.js per le finestre con sessioni diversa
  win.setMenuBarVisibility(false);

  win.setResizable(true);
  win.on('closed', () => {
    app.quit();
  });

}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if(process.platform !== 'darwin'){
    app.quit();
  }
});

