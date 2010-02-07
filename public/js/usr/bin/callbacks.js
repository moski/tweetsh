/*
 *  callbacks.js
 *  Define the callbacks for the ajax request
 *  Copyright 2010 Monther. All rights reserved.
 *
 *  require 'inode.h.js'	
 */


/* The container for system calls **/  
shell.module("shell.callbacks");

shell.callbacks.getUser = function(data){
	if(shell.twitter.errored(data)){
		shell.errors.errindex = "ENOTDIR";
		shell.execFromCallStack(true);
	}else{
		var user = data['data'];
		shell.syscalls.mkdirHome(user['path'],user['screen_name']);
		
		// ok, lets redo and call the command again after we've created the directory. 
		shell.execFromCallStack(false);
	}
}

shell.callbacks.lsTweets = function(data){
	shell.execCallBack(data);
}


shell.callbacks.lsUsers = function(data){
	shell.execCallBack(data);
}

shell.callbacks.getUserTabCompletion = function(data){
	if(shell.twitter.errored(data)){
				
	}else{
		var user = data['data'];
		shell.syscalls.mkdirHome(user['path'],user['screen_name']);
		e = jQuery.Event("keydown");
		e.keyCode = 9;
		shell.UI.inputField.trigger(e);
	}
}


// the callback after tweeting.
shell.callbacks.tweet = function(data){
	if(shell.twitter.errored(data)){
		shell.errors.errindex = "GENERAL";
		shell.std.cerr(" " + data['data'].error);
		shell.prepareForNextCommand();
	}else{
		shell.std.cout(data['data'] , eval("shell.parsers." + data['json_class']));
		shell.prepareForNextCommand();
	}
}