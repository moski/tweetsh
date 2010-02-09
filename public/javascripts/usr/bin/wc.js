/*
 *  wc.js
 *  wc -- word and character count.
 *
 *  require 'inode.h.js'
 *  require 'shell.h.js'
 *  require 'commands.js'
 *  require 'iostream.js'
 */
shell.command.wc = function(){
  this.name = "wc";
  this.aliases = new Array("wc");
  this.help = "word and character count. ls /home/moski_doski/timelines/timeline | tail -n 1 | wc";

  this.errors = function(){
	var error_arr 	= new Array();
	error_arr["HEAD_NOINPUT"] = "requires an input";
	error_arr["HEAD_NOPTION"]   = "option require an argument";
	return error_arr;
  }
  
  this.call = function(args){
	// Validate incoming input
	if(!args || args.length == 0){
		shell.errors.errindex = "HEAD_NOINPUT";
		return this.fail(" -> example: ls /public_timeline | tail | wc -m ");
	}
	
	var count  = 1;	
	var data   = null;
	var parser = null;
 	
	var sw = 0; // 0 for char count ; 1 for word count.

	// parse the incoming params
	for(i=0; i < args.length; i++){
		if (args[i] == '-m'){
			sw = 0;
		}else if(args[i] == '-w'){
			sw = 1;
		}
		else{
			data = args[i];
		} 
	}
	
	if(typeof(data['data']) != undefined){
		parser = data['parser'];
		data = data['data'];
	}
	
	
	(sw == 0) ? this.charCount(data) : this.wordCount(data);
  	return true;
  }

  this.fail = function(msg){
	shell.std.cerr(msg);
  }
  
  // print the number of chars	
  this.charCount = function(data){
	var count = 0;
	if(jQuery.isArray(data)){
		for(var i=0;i < data.length; i++){
			count += this.charCountHelper(data[i]);
		}
	}else{
		count += this.charCountHelper(data);
	}
	shell.std.cout(count);
	return true;
  }
 
  // get the length depending on the object type.
  this.charCountHelper = function(value){
 	 var count = 0;
	 if(value['json_class'] == 'Tweet'){
	  	count += value['data']['text'].length;
	 }else if(value['json_class'] == 'Inode'){
		count += value.name.length;
	 }
	 return count;
  }
  	
  this.wordCount = function(data){
	var count = 0;
	if(jQuery.isArray(data)){
		for(var i=0;i < data.length; i++){
			count += this.wordCountHelper(data[i]);
		}
	}else{
		count += this.wordCountHelper(data);
	}
	shell.std.cout(count);
	return true;
  }

  // get the words count depending on the object type.
  this.wordCountHelper = function(value){
 	 var count = 0;
	 if(value['json_class'] == 'Tweet'){
	  	count += value['data']['text'].split(" ").length;
	 }else if(value['json_class'] == 'Inode'){
		count += value.name.split(" ").length;
	 }
	 return count;
  }	
}
shell.commands.require("wc")