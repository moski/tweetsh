/*
 *  clear.js
 *  clears the screen
 *  Copyright 2010 Monther. All rights reserved.
 *	 
 *   require 'shell.h.js'
 *   require 'commands.js'
 *   require 'iostream.js'	
 */

shell.command.clear = function(){
  this.name = "clear";
  this.aliases = new Array("clear","c");
  this.help = "clear the screen";

  // no errors, just clear the frakkin screen ...	
  this.errors = function(){
  	return [];
  }

  this.call = function(args){
  	shell.std.clear();
	shell.prepareForNextCommand();
  }
}
shell.commands.require("clear");