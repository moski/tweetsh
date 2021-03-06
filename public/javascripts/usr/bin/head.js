/*
 *  head.js
 *  head -- display first lines of a file/tweet
 *
 *  require 'inode.h.js'
 *  require 'shell.h.js'
 *  require 'commands.js'
 *  require 'iostream.js'
 */
shell.command.head = function(){
  this.name = "head";
  this.aliases = new Array("head");
  this.help = "display first lines of a file/tweet. ls /home/moski_doski/timelines/timeline | head -n 1";

  this.errors = function(){
	var error_arr 	= new Array();
	error_arr["HEAD_NOINPUT"] = "requires an input";
	error_arr["HEAD_NOPTION"]   = "option require an argument";
	return error_arr;
  };
  
  this.call = function(args){
	// Validate incoming input
	if(!args || args.length == 0){
		shell.errors.errindex = "HEAD_NOINPUT";
		return this.fail(" -> example: ls /public_timeline | head ");
	}
	
	var count  = 5;	
	var data   = null;
	var parser = null;
 	
	// Validate and the -n param
	for(i=0; i < args.length; i++){
		if (args[i] == '-n'){
			if(!args[i+1]){
				shell.errors.errindex = 'HEAD_NOPTION';
				return this.fail("");
			}
			count = args[i+1];
		}else{
			data = args[i];
		} 
	}
	
	if(typeof(data['data']) != undefined){
		parser = data['parser'];
		data = data['data'];
	}
	data = data.slice(0,count);
	shell.std.cout(data , parser);
  };

  this.fail = function(msg){
	shell.std.cerr(msg);
  };

};
shell.commands.require("head");