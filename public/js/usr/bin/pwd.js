/*
 *  pwd.js
 *  Find the current working directory
 *  Copyright 2010 Monther. All rights reserved.
 *
 *  require 'inode.h.js'
 *  require 'shell.h.js'
 *  require 'commands.js'
 *  require 'iostream.js'
 */
shell.command.pwd = function(){
  this.name = "pwd";
  this.aliases = new Array("pwd");
  this.help = "return working directory name";

  // as easy as it gets, no errors for this function ... assuming my inode validation is working :)
  this.errors = function(){
	return [];
  }
  
  this.call = function(args){
	var output = '<div>' + shell.syscalls.getPWD() + '</div>';	
	shell.std.count(output);
	shell.prepareForNextCommand();
  }
}
shell.commands.require("pwd");