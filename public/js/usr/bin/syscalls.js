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
shell.syscalls.mkdir = function(path){
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
shell.syscalls.path2Inode = function(path , callback){
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
		current = shell.syscalls.DIRGlob(names[i] , current , callback);
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
shell.syscalls.DIRGlob = function(name , folderInode , callback){
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
	
	// ok, if this folder listens to an external cd , send the ajax request.
	if(folderInode.mount_ptr != null &&  jQuery.ArrayHasKey(folderInode.mount_ptr, 'cd')){
		var mount_st 	 = folderInode.mount_ptr['cd'];
		var current_path = shell.syscalls.inode2Path(folderInode); 
		if(callback == undefined) callback = mount_st.mount_callback;
		
		
		// Had to use ajax not straight post because i need to disable the global beforeSend
		// function, for this call, we don't alway want to disable the input. Example, tab completion.
		// If the command wants to disable the input, it has to do it manually, check CD command for more info.
		$.ajax({
			type: "POST",  
			url: '/' + mount_st.mount_to,
		  	dataType: "json",
			data: {user: name , path : current_path},
			success: eval(callback),
			beforeSend: function(){}
		});
		//$.post('/' + mount_st.mount_to , {user: name , path : current_path}, eval(callback) , "json");
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
   cd				--> cammdn
   mount_point 		--> The Ajax Call it sends to check when validating the inode
   mount_callback	--> The ajax callback.
   for example
     mount("/home/" , "cd" ,"twitter/users" , "shell.callback.getUser"); 
     will map the home folder to the twitter/users action for the CD command ...
     so if i do "cd /home/moski_doski" --> will search home for inode called moski_doski
     if it doesn't exisit , it calls /twitter/users/   and awaits for its call back in shell.callback.getUser
  
   I honstely couldn't think of any better/cleaner way of doing this.
**/
shell.syscalls.mount = function (path, cmd , mount_point, mount_callback){
	var node = shell.syscalls.path2Inode(path)
	if (node == shell.macros.FAIL){
		return node;
	} 
	var mount_st = new mount_struct(mount_point,mount_callback);
	if(node.mount_ptr == null){
		node.mount_ptr = new Array();
	}
	node.mount_ptr[cmd] = mount_st;
	return shell.macros.PASS;
}

shell.syscalls.mkdirHome = function(basedir , username){
	// home folder
	var path		   = shell.twitter_FS.join(basedir , username);
	shell.syscalls.mkdir(path);
	
	//timelines
	//	var fr_timeline_path   = shell.twitter_FS.join(path , 'friends_timeline');
	//	shell.syscalls.mkdir(timeline_path);
	//	shell.syscalls.mkdir(fr_timeline_path);
	//	shell.syscalls.mount(fr_timeline_path,  "ls","twitter/timelines/friends_timeline", "shell.callbacks.lsTweets");
	
	// [/home/USER/timelines/]
	var timelines = shell.twitter_FS.join(path , 'timelines');
	shell.syscalls.mkdir(timelines);
	shell.syscalls.mkdirAndMount(shell.twitter_FS.join(timelines , 'timeline') , "ls" ,"twitter/timelines/user_timeline","shell.callbacks.lsTweets")
	
	
	
	// If i am building my own homeDir
	if(shell.twitter.loggedIn() && shell.config.user == username){
		shell.syscalls.mkdirAndMount(shell.twitter_FS.join(timelines , 'personal') , "ls" ,"twitter/timelines/home_timeline","shell.callbacks.lsTweets")
		shell.syscalls.mkdirAndMount(shell.twitter_FS.join(path , 'mentions') , "ls" ,"twitter/mentions","shell.callbacks.lsTweets")
		
		// retweets
		var retweets  	  = shell.twitter_FS.join(path , 'retweets');
		shell.syscalls.mkdir(retweets);
		shell.syscalls.mkdirAndMount(shell.twitter_FS.join(retweets , 'by_me'), "ls" , "twitter/retweets/by_me"  , "shell.callbacks.lsTweets");
		shell.syscalls.mkdirAndMount(shell.twitter_FS.join(retweets , 'to_me'), "ls","twitter/retweets/to_me"    , "shell.callbacks.lsTweets");
		shell.syscalls.mkdirAndMount(shell.twitter_FS.join(retweets , 'of_me'), "ls","twitter/retweets/of_me"    , "shell.callbacks.lsTweets");
		
		// fav/personal
		shell.syscalls.mkdirAndMount(shell.twitter_FS.join(path , 'favorites'), "ls","twitter/favorites/private" , "shell.callbacks.lsTweets");
	}else{
		shell.syscalls.mkdirAndMount(shell.twitter_FS.join(path , 'mentions') , "ls" ,"twitter/public_mentions","shell.callbacks.lsTweets")
		shell.syscalls.mkdirAndMount(shell.twitter_FS.join(path , 'favorites'), "ls","twitter/favorites/public" , "shell.callbacks.lsTweets");
	}
	
	
	// friends and followers
	var friends_path   = shell.twitter_FS.join(path , 'friends');
	var followers_path = shell.twitter_FS.join(path , 'followers');
	shell.syscalls.mkdir(friends_path);
	shell.syscalls.mkdir(followers_path);
	shell.syscalls.mount(friends_path,   "ls","twitter/users/friends"   ,"shell.callbacks.lsUsers"); 
	shell.syscalls.mount(followers_path, "ls","twitter/users/followers" ,"shell.callbacks.lsUsers"); 	
}

// just to clean things out.
shell.syscalls.mkdirAndMount = function(full_path , cmd , mount_point  , mount_callback){
	shell.syscalls.mkdir(full_path);
	shell.syscalls.mount(full_path, cmd , mount_point , mount_callback);
}