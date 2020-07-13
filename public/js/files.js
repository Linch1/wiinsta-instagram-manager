const fs = require('fs');

function read_file(path){
	return fs.readFileSync(path, 'utf-8');
}

function write_file(path, content){
	fs.writeFileSync(path, content, 'utf8');
}

function append_file(path, content){
  if(!exists_file(path)) return;
	fs.appendFileSync(path, content, 'utf8');
}

function move_file(file, path){
  return fs.renameSync(file, path);
}

function exists_file(path){
  return fs.existsSync(path);
}

function get_files(path){
  return fs.readdirSync(path, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name)
}

function get_directories(path){
	return fs.readdirSync(path, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
}

function get_files_and_folders(path){
  return fs.readdirSync(path, { withFileTypes: true })
    .map(dirent => dirent.name);
}


function create_file(path, content){
  if (!fs.existsSync(path)) {
      write_file(path, content);
  }
}

function create_dir(path){
  if (!fs.existsSync(path)){
      fs.mkdirSync(path);
  }
}

function remove_file(path){
	fs.unlinkSync(path);
}

function deleteFolderRecursive(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};
