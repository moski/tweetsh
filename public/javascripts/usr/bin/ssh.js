/*
 *  ssh.js
 *  Authenticate the user.
 *
 *  require 'inode.h.js'
 *  require 'shell.h.js'
 *  require 'commands.js'
 *  require 'iostream.js'
 */
shell.command.ssh = function(){
  this.name = "ssh";
  this.aliases = new Array("ssh" , "login");
  this.help = "Login to your twitter account --> (Oauth)";
  this.parameters  = "N/A";
  
  // as easy as it gets, no errors for this function ... assuming my inode validation is working :)
  this.errors = function(){
	return [];
  }
  
  this.call = function(args){
	shell.UI.lockInput();
	window.location.replace("/oauth/connect");
  }
}
shell.commands.require("ssh");