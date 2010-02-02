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
  
  // define errors for the cd command. errors function will be included when we require the command.
  this.errors = function(){
	 var error_arr 	= new Array();
	 error_arr["ENOTDIR"] = "No such file or directory";
	 error_arr["EBADF"]   = "No such file or directory";
	 return error_arr;	
  }

  this.call = function(args){
 	var out = shell.syscalls.chdir(args[0]);
	if(out == shell.macros.PASS){		
		this.pass();
	}else if(out == shell.macros.FAIL){
		this.fail();
	}else{
		shell.std.clog("Pending the Ajax Request to validate " + args[0]);
		return false;
	}
  }
  this.fail = function(){
	shell.std.cerr("");
	shell.prepareForNextCommand();
  }	
  this.pass = function(){
	/* Update the prompt after changing the directory **/
	shell.UI.setPrompt();
	shell.prepareForNextCommand();	
  }
}
shell.commands.require("cd");