/*
 *  pwd.js
 *  Find the current working directory
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
  this.parameters  = "N/A";

  // as easy as it gets, no errors for this function ... assuming my inode validation is working :)
  this.errors = function(){
	return [];
  };
  
  this.call = function(args){
	var output = '<div>' + shell.syscalls.getPWD() + '</div>';	
	shell.std.cout(output);
	shell.prepareForNextCommand();
  };
};
shell.commands.require("pwd");