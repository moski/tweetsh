/*
 *  head.js
 *  head -- display first lines of a file/tweet
 *  Copyright 2010 Monther. All rights reserved.
 *
 *  require 'inode.h.js'
 *  require 'shell.h.js'
 *  require 'commands.js'
 *  require 'iostream.js'
 */
shell.command.head = function(){
  this.name = "head";
  this.aliases = new Array("head");
  this.help = "display first lines of a file";

  this.errors = function(){
	var error_arr 	= new Array();
	error_arr["NOINPUT"] = "requires an input";
	error_arr["EBADF"]   = "option require an argument";
	return [];
  }
  
  this.call = function(args){
	var count  = 3;	
  	var data   = args[0];
	var parser = null;
	if( typeof(data['data']) != undefined){
		parser = data['parser'];
		data = data['data'];
	}
	data = data.slice(0,count);
	shell.std.cout(data , parser);
  }
}
shell.commands.require("head")