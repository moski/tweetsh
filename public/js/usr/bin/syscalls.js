/*
 *  syscalls.js
 *  Define the most important operation in system
 *  Copyright 2010 Monther. All rights reserved.
 *
 *  require 'inode.h.js'	
 */

/* The container for system calls **/  
shell.module("shell.syscalls");

/* Add a new node to the tree **/
shell.syscalls.mkdir = function(path , mount_point){
	var mount_point = null;
	
	// if the path is relative make it absoulte
	if(shell.twitter_FS.isRelative(path)){
		path = shell.twitter_FS.expandPath(path);
	}
	var parent = null;
	if(path != "/"){
		parent = shell.syscalls.path2Inode(shell.twitter_FS.dirname(path));
	}
		
	if(parent == false){
		return false;
	}
	
	// Ok, @ this point the parent path exists
	var node 		= new twitter_inode(shell.twitter_FS.MODE_DIR , shell.twitter_FS.ACL_PUBLIC , [] , parent  , shell.twitter_FS.basename(path) , mount_point);
	var node_parent = new twitter_inode(shell.twitter_FS.MODE_DIR , shell.twitter_FS.ACL_PUBLIC , [] , node  , ".." , 3);
	var node_self   = new twitter_inode(shell.twitter_FS.MODE_DIR , shell.twitter_FS.ACL_PUBLIC , [] , node  , "."  , 3);
	
	// if we are creating the root node, then parent == node == root
	if(path == "/"){
		shell.twitter_FS.root = node;
			
		node.parent 	   = shell.twitter_FS.root;
		node_parent.parent = shell.twitter_FS.root;
		node.node_self     = shell.twitter_FS.root;
	
		shell.twitter_FS.root.children.push(node_parent);
		shell.twitter_FS.root.children.push(node_self);
	}else{
		parent.children.push(node);
		node.children.push(node_parent);
		node.children.push(node_self);
	}
}

/* Given the path, return the inode object for path **/
shell.syscalls.path2Inode = function(path){
	if(path == "/"){
		return shell.twitter_FS.root;
	}
	
	// if the path is relative make it absoulte
	if(shell.twitter_FS.isRelative(path)){
		path = shell.twitter_FS.expandPath(path);
	}
	
	// Split the path into names
	// Note that we need to remove all the empty string generated from 
	// the split function. "/home/".split("/") will generate ["" , home , ""]
	var names = path.split("/"); 
	names = jQuery.ArrayCompact(names);
	
	// a pointer to the current inode
	var current = shell.twitter_FS.root;		
	
	for (var i=0; i<names.length; i++) {
		current = shell.syscalls.DIRGlob(names[i] , current);
		if(current == shell.macros.FAIL || current == shell.macros.PENDING){
			return current;
		}
	}
	return current;
}

/* Given the inode , give me the fullpath **/
shell.syscalls.inode2Path = function(inode){
	var current = inode;
	var path = [];
	// Loop until we get to the root node.
	while(current.parent != current){
		path.push(current.name);
		current = current.parent;
	}
	// reverse the array because we travered backwardly
	path = path.reverse()
	return "/" + path.join("/");
}

/* Return a file in a given folder **/
shell.syscalls.DIRGlob = function(name , folderInode){
	if(name == ".."){
		return folderInode.parent;
	}
	if(name == "."){
		return folderInode;
	}
	for(var i=0; i < folderInode.children.length; i++){
		if(folderInode.children[i].name == name){
			return folderInode.children[i];
		}
	}
	
	if(folderInode.mount_to != null){
		$.post('/' + folderInode.mount_to , {user: name}, eval(folderInode.mount_callback) , "json");
		shell.std.clog(folderInode.name + " is a mounted to --> " + folderInode.mount_to);
		return shell.macros.PENDING;
	}
	
	shell.errors.errindex = "ENOTDIR";
	return shell.macros.FAIL;
}

/* return working directory name **/
shell.syscalls.getPWD = function(){
	return shell.syscalls.inode2Path(shell.twitter_FS.cwd);
}

/* change the current working dir into the given path **/
shell.syscalls.chdir = function(path){
	var node = null
	if(path == "-"){	
		node = shell.twitter_FS.cwdOld;
	}else{
		node = shell.syscalls.path2Inode(path);
	}
	
	if(node == shell.macros.FAIL || node == shell.macros.PENDING){
		return node;
	}else{
		if(node.mode == shell.twitter_FS.MODE_DIR){
			shell.twitter_FS.cwdOld = shell.twitter_FS.cwd;
			shell.twitter_FS.cwd = node;
			return 1;
		}else{
			shell.errors.errindex = "ENOTDIR";
			return shell.macros.FAIL;
		}
	}
	return shell.macros.FAIL;
}

/* Mount folder to interact with twitter + localfile structure.
   mount_point 		--> The Ajax Call it sends to check when validating the inode
   mount_callback	--> The ajax callback.
   for example
     mount("/home/" , "twitter/users" , "shell.callback.getUser"); 
     will map the home folder to the twitter/users action ...
     so if i do "cd /home/moski_doski" --> will search home for inode called moski_doski
     if it doesn't exisit , it calls /twitter/users/   and awaits for its call back in shell.callback.getUser
  
   I honstely couldn't think of any better/cleaner way of doing this.
**/
shell.syscalls.mount = function (path, mount_point, mount_callback){
	var node = shell.syscalls.path2Inode(path)
	if (node == shell.macros.FAIL){
		return node;
	} 
	node.mount_to = mount_point;
	node.mount_callback = mount_callback;
	return shell.macros.PASS;
}