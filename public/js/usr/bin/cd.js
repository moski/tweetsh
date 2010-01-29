/*
 *  cd.js
 *  change the current working directory
 *  Copyright 2010 Monther. All rights reserved.
 *	 
 *   require 'shell.h.js'
 *   require 'commands.js'
 *   require 'iostream.js'	
 */

shell.command.cd = function(){
  this.name = "cd";
  this.aliases = new Array("cd");
  this.help = "Change the working directory to the specified user";
  this.helptext = "";

  this.call = function(args){
  	
	shell.syscalls.chdir(args[0]);
	
	/* Update the prompt after changing the directory **/
	shell.UI.setPrompt();
	
	shell.prepareForNextCommand();
  }
}
shell.commands.require("cd");