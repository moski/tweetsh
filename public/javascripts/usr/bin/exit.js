/*
 *  exit.js
 *  Authenticate the user.
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
  this.parameters  = "N/A";  

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