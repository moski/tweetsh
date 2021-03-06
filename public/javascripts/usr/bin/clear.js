/*
 *  clear.js
 *  clears the screen
 *	 
 *   require 'shell.h.js'
 *   require 'commands.js'
 *   require 'iostream.js'	
 */

shell.command.clear = function(){
  this.name = "clear";
  this.aliases = new Array("clear","c");
  this.help = "clear the screen";
  this.parameters  = "N/A";  

  // no errors, just clear the frakkin screen ...	
  this.errors = function(){
  	return [];
  };

  this.call = function(args){
  	shell.std.clear();
	shell.prepareForNextCommand();
  };
};
shell.commands.require("clear");