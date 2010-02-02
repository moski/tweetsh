/*
 *  ssh.js
 *  Authenticate the user.
 *  Copyright 2010 Monther. All rights reserved.
 *
 *  require 'inode.h.js'
 *  require 'shell.h.js'
 *  require 'commands.js'
 *  require 'iostream.js'
 */
shell.command.ssh = function(){
  this.name = "ssh";
  this.aliases = new Array("ssh");
  this.help = "login to your twitter account";

  // as easy as it gets, no errors for this function ... assuming my inode validation is working :)
  this.errors = function(){
	return [];
  }
  
  this.call = function(args){
	shell.UI.lockInput();
	window.location = "/oauth/connect";
  }
}
shell.commands.require("ssh");