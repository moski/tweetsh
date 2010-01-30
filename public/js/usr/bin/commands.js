/*
 *  commands.js
 *  controls the commands structure, every command must be required here before we can
 *  use it.
 *  Copyright 2010 Monther. All rights reserved.
 *	 
 *   require 'shell.h.js'
 *   	
 */

/* Commands definations  **/  
shell.module("shell.commands");
shell.module("shell.command");
shell.module("shell.commandObj");

/* A Hash that contains all the commands **/
shell.commands.list = new Array();

/* Base Function to every command we define **/
shell.command.base = function(){
  this.mode = false;
  this.parameters = "";
  this.help = "no helptext yet.";
  this.helpText = "";
  this.hasMore = false;
  this.results = new Array();
  this.errors = new Array();
}


/* the command includer function, use this function to require a command and use it. **/
shell.commands.require = function(name,base){
  /* Set the default base function for the command unless the base is defined **/ 
  if(!base) base = "base";  
  eval('shell.command.'+name+'.prototype = new shell.command.'+base+';'+
       'shell.commandObj.'+name+' = new shell.command.'+name+';'+
       'shell.commands.list["'+name+'"] = shell.commandObj.'+name+";");
  
  // push the definded errors for this command into the global error hash
  jQuery.ArrayCopyAssociative(shell.errors.errors ,   shell.commands.findCommand(name).errors())
}

/* Return a list of all commands defined including the aliases **/
shell.commands.listWithAlias = function(){
	var arr = [];
	for(key in shell.commands.list){
		arr = arr.concat(shell.commands.list[key].aliases);
  	}
    return arr;
}

/* Return a list of all commands defined including the aliases **/
shell.commands.findCommand = function(command){
	var searcher = null;
	for(key in shell.commands.list){
		if(jQuery.isValueIncludedInArray(command,shell.commands.list[key].aliases)){
      		searcher = shell.commands.list[key];
//      	args[0] = searcher.name;
      		break;
     	}
  	}
	return searcher;
}

