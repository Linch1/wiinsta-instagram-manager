const remote        = require('electron'),
      app           = remote.app,
      BrowserWindow = remote.BrowserWindow,
      nativeImage   = remote.nativeImage,
      {datas}       = require('./input-schema.js'),
      fs            = require('fs'),
      mkdirp        = require('mkdirp'),
      ejse          = require('ejs-electron'),
      setupEvents   = require('./installers/setupEvents');

const path = require('path');

//handle setupevents as quickly as possible
if (setupEvents.handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
 }

// define the folders where to store the bot datas
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

// check if the folders exists
for (let i = 0; i < folders.length; i++) {
  let folder = folders[i]
  if (!fs.existsSync(folder)){
      fs.mkdirSync(folder);
  }
}

// define the default values in the datas/profiles.txt file
let common_object = {
  "session-id-counter":0,
  "last-notification-id": 0
}
let common_object_keys = Object.keys(common_object);

if (!fs.existsSync(DatasPath + 'datas/profiles.txt')){
    fs.writeFileSync(DatasPath + 'datas/profiles.txt', JSON.stringify(common_object), 'utf8');
} else {
  // check if some values are not presents in the profile.txt file and add them
  let profiles_obj = fs.readFileSync(DatasPath + 'datas/profiles.txt', 'utf-8');
  profiles_obj = JSON.parse(profiles_obj);
  for ([key, value] of Object.entries(common_object)){
    if(!profiles_obj[key]) profiles_obj[key] = value;
  }
  fs.writeFileSync(DatasPath + 'datas/profiles.txt', JSON.stringify(profiles_obj), 'utf8');
}

// Create the browser window.
function createWindow () {
  let win = new BrowserWindow({
    width: 1200,
    height: 750,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.setIcon(
    nativeImage.createFromPath(
      path.join(__dirname, "/icons/png/icon.png")
    )
  );
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

