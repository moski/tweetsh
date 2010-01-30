/*
 *  twitter.js
 *  Deals with the twitter data(parse json ... etc)
 *  Copyright 2010 Monther. All rights reserved.
 *	
 */


/* The container for system calls **/  
shell.module("shell.twitter");

shell.twitter.errored = function(json){
	return (json['data'].error ? true : false);
}