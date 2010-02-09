/*
 *  twitter.js
 *  Deals with the twitter data(parse json ... etc)
 *	
 */


/* The container for system calls **/  
shell.module("shell.twitter");

shell.twitter.errored = function(json){
	return (json['data'].error ? true : false);
};

shell.twitter.loggedIn = function(){
	return (shell.config.user != 'nobody');
};