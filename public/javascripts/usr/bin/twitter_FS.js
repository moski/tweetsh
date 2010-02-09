/*
 *  twitter_FS.js
 *  The core of the file structure used on top of twitter
 *
 *  require 'inode.h.js'	
 */


/* A pointer to the root node for the tree **/
shell.twitter_FS.root = null;

/* A pointer to the current working directory **/
shell.twitter_FS.cwd = null
shell.twitter_FS.cwdOld = null

/* Initialize the twitter_FS by creating the main data strcuture **/
shell.twitter_FS.initialize = function(current_user){
	if(current_user == undefined){
		shell.config.user = "nobody";
	}else{
		shell.config.user = current_user;
	}
	
	shell.syscalls.mkdir("/");
	shell.syscalls.mkdir("/home" , "twitter/users");
	shell.syscalls.mount("/home/" , "cd" ,"twitter/users" ,"shell.callbacks.getUser"); 
	
	shell.syscalls.mkdirAndMount("/public_timeline" , "ls" ,"twitter/timelines/public_timeline","shell.callbacks.lsTweets");
	
	if(shell.twitter.loggedIn()){
		shell.syscalls.mkdirHome("/home/",shell.config.user);
		shell.syscalls.chdir(shell.twitter_FS.join("/home/" , shell.config.user));
	}else{
		shell.syscalls.chdir('/');
	}
}

/* check if a path is relative **/
shell.twitter_FS.isRelative = function(path){
	return path[0] != '/'
}


shell.twitter_FS.basename = function(path){
	var b = path.replace(/^.*[\/\\]/g, '');
    if (typeof(suffix) == 'string' && b.substr(b.length-suffix.length) == suffix) {
    	b = b.substr(0, b.length-suffix.length);
    }    
    return b;
}

shell.twitter_FS.dirname = function(path){
	var dir = path.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');
	if(dir == ""){
		return "/";
	}
	return dir;
}


shell.twitter_FS.expandPath = function(path){
	return shell.twitter_FS.join(((shell.twitter_FS.cwd == null) ? "/" : shell.syscalls.getPWD()), path); 
}


/* Returns a new string formed by joining the strings using File::SEPARATOR. **/
shell.twitter_FS.join = function(path1 , path2){
	if(path1.charAt(path1.length -1) == shell.twitter_FS.File_SEPARATOR){
		path1 = path1.slice(0, -1);
	}
	
	if(path2.charAt(0) == shell.twitter_FS.File_SEPARATOR){
		path2 = path2.substr(1);
	}
	return path1 + shell.twitter_FS.File_SEPARATOR + path2;
}

// Given an inode, filter the children to find all the children that contains a string
shell.twitter_FS.filterChildren = function(children , str){
	// If no string to match, return all the children.
	if(str == ""){
		return children;
	}
	var arr = [];
	for(var i=0; i < children.length; i++){
		var reg = new RegExp('\\b'+ str, 'gi');
		if(reg.exec(children[i].name)){
			arr.push(children[i]);
		}
	}
	return arr;
}

shell.twitter_FS.getNamesFromInodes = function(arr){
	var names = []
	for(var i=0; i < arr.length; i++){
		names.push(arr[i].name);
	}
	return names;
}