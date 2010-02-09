/*
 *  wall.js
 *  wall -- Write a message to all followers.(tweeting)
 *
 *  require 'inode.h.js'
 *  require 'shell.h.js'
 *  require 'commands.js'
 *  require 'iostream.js'
 */
shell.command.wall = function(){
  this.name = "wall";
  this.aliases = new Array("wall");
  this.help = "Write a message to all followers.(tweeting); wall 'So say we all, tweetsh is awesome'";

  this.errors = function(){
	var error_arr 	= new Array();
	error_arr["HEAD_NOINPUT"] = "requires an input";
	error_arr["WALL_LOGGED_IN"]   = "Must be logged in to use the wall command";
	return error_arr;
  };
  
  this.call = function(args){
	var tweet = "";
	var data = args[0];
	// validate authentication
	if(!shell.twitter.loggedIn()){
		shell.errors.errindex = "WALL_LOGGED_IN";
		return this.fail("");
	}
	
	// validate incoming input
	if(!args || args.length == 0){
		shell.errors.errindex = "HEAD_NOINPUT";
		return this.fail("");
	}
	
	if(args.length >= 1 && typeof(data['data']) == "undefined"){
		for (var i = 0; i < args.length; i++){
		  tweet += args[i] + ' ';
		}
	}else{
		parser = data['parser'];
		data = data['data'];
		tweet = this.parseInput(data);
	}
	
	$.post('/twitter/update', {update: tweet}, shell.callbacks.tweet , "json");
  	shell.UI.lockInput();
	return false;
  };
  this.fail = function(msg){
	shell.std.cerr(msg);
  };

  this.parseInput = function(data){
	var tweet = '';
	if(jQuery.isArray(data)){
		tweet = this.parseInputHelper(data[0]);
	}else{
		tweet = this.parseInputHelper(data);
	}
	return tweet;
  };

  this.parseInputHelper = function(value){
	var tweet = '';
	if(value['json_class'] == 'Tweet'){
	  	tweet = value['data']['text'];
	}else if(value['json_class'] == 'Inode'){
		tweet = value.name;
	}
	return tweet;	
  };
};
shell.commands.require("wall");