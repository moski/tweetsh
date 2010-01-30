/*
 *  twitter_FS.js
 *  The core of the file structure used on top of twitter
 *  Copyright 2010 Monther. All rights reserved.
 *
 *  require 'inode.h.js'	
 */


/* A pointer to the root node for the tree **/
shell.twitter_FS.root = null;

/* A pointer to the current working directory **/
shell.twitter_FS.cwd = null
shell.twitter_FS.cwdOld = null

/* Initialize the twitter_FS by creating the main data strcuture **/
shell.twitter_FS.initialize = function(){
	shell.syscalls.mkdir("/");
	shell.syscalls.mkdir("/home" , "twitter/users");
	shell.syscalls.mount("/home/" , "twitter/users" ,"shell.callbacks.getUser"); 
	
	/* Set the current working directory to "/"  **/
	shell.syscalls.chdir("/home");
}

/* check if a path is relative **/
shell.twitter_FS.isRelative = function(path){
	return path[0] != '/'
}


shell.twitter_FS.basename = function(path){
	var tmp_arr = path.split("/");
	path =  tmp_arr.pop();
	if (path == ""){
		return "/";
	}
	return path;
}

shell.twitter_FS.dirname = function(path){
	var tmp_arr = path.split("/");
	tmp_arr.pop();
	path = tmp_arr.join("/");
	if(path == ""){
		return "/"
	}
	return path;
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
