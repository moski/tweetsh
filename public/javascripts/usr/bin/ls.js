/*
 *  ls.js
 *  list directory contents
 *	 
 *   require 'shell.h.js'
 *   require 'commands.js'
 *   require 'iostream.js'	
 */

shell.command.ls = function(){
  this.name = "ls";
  this.aliases = new Array("ls");
  this.help = "list directory contents";
  this.helptext = "";
  this.parameters  = "path"; 

  // define errors for the cd command. errors function will be included when we require the command.
  this.errors = function(){
	 var error_arr 	= new Array();
	 error_arr["ENOTDIR"] = "No such file or directory";
	 error_arr["EBADF"]   = "No such file or directory";
	 return error_arr;	
  };

  this.call = function(args){
	var path = args[0];
	if(path == null) path = ".";

	var inode = shell.syscalls.path2Inode(path);
	if(inode == shell.macros.FAIL){
		this.fail();
	}else if(inode == shell.macros.PENDING){
		return false;
	}else{
		this.porcess(inode);
	}
  };
  this.fail = function(msg){
	if(msg == undefined) msg = "";
	shell.std.cerr(msg);
	shell.prepareForNextCommand();
  };
  this.pass = function(){
	shell.prepareForNextCommand();
  };
  
  /* Ok, we have the node, its time to show some results **/ 	
  this.porcess = function(node){
	if(node.mount_ptr != null &&  jQuery.ArrayHasKey(node.mount_ptr, 'ls')){
		var mount_st 	 = node.mount_ptr['ls'];
		var current_path = shell.syscalls.inode2Path(node); 
		$.post('/' + mount_st.mount_to , {path : current_path}, eval(mount_st.mount_callback) , "json");
	}else{
		shell.std.cout(node.children , shell.parsers.inodeArray);
		this.pass();
	}
  };
  this.callback = function(data){
	if(shell.twitter.errored(data)){
		shell.errors.errindex = "GENERAL";
		this.fail(" " + data['data'].error);
	}else{
		shell.std.cout(data['data'] , eval("shell.parsers." + data['json_class']));
		this.pass();
	}
  };
};
shell.commands.require("ls");