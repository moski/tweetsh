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

  this.call = function(args){
	var div = '<div>' + shell.syscalls.getPWD() + '</div>';	
	shell.UI.outputElement.append(div);
	shell.prepareForNextCommand();
	//return shell.syscalls.getPWD();
  }
}
shell.commands.require("pwd");