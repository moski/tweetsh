/*
 *  exit.js
 *  Authenticate the user.
 *  Copyright 2010 Monther. All rights reserved.
 *
 *  require 'inode.h.js'
 *  require 'shell.h.js'
 *  require 'commands.js'
 *  require 'iostream.js'
 */
shell.command.exit = function(){
  this.name = "exit";
  this.aliases = new Array("exit");
  this.help = "Termimate your current session with twitter.com ";

  // as easy as it gets, no errors for this function ... assuming my inode validation is working :)
  this.errors = function(){
	return [];
  }

  this.call = function(args){
	shell.UI.lockInput();
	window.location = "/oauth/disconnect";
  }
}
shell.commands.require("exit");