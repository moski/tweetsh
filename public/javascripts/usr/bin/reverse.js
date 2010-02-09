/*
 *  reverse.js
 *  reverse -- reverse the incoming input
 *
 *  require 'inode.h.js'
 *  require 'shell.h.js'
 *  require 'commands.js'
 *  require 'iostream.js'
 */
shell.command.reverse = function(){
  this.name = "reverse";
  this.aliases = new Array("reverse");
  this.help = "reverse the incoming dirs/tweets. ls /home/moski_doski/timelines/timeline | reverse ";
  this.parameters  = "input(list of tweets or list of dirs)"; 
  this.errors = function(){
	var error_arr 	= new Array();
	error_arr["HEAD_NOINPUT"] = "requires an input";
	return error_arr;
  };
  
  this.call = function(args){
	// Validate incoming input
	if(!args || args.length == 0){
		shell.errors.errindex = "HEAD_NOINPUT";
		return this.fail(" -> example: ls /public_timeline | reverse | head ");
	}
	
	var count  = 1;	
	var data   = args[0];
	var parser = null;
 		
	if(typeof(data['data']) != undefined){
		parser = data['parser'];
		data = data['data'];
	}
	data.reverse();
	shell.std.cout(data , parser);
  };

  this.fail = function(msg){
	shell.std.cerr(msg);
  };

};
shell.commands.require("reverse");