/*
 *  main.js
 *  Find the current working directory
 *
 *  require 'inode.h.js'
 *  require 'shell.h.js'
 *  require 'commands.js'
 *  require 'iostream.js'
 */
shell.command.man = function(){
  this.name = "man";
  this.aliases = new Array("help","man","h","?");
  this.help = "displays help text";
  this.parameters = "[command]";
    

  // as easy as it gets, no errors for this function ... assuming my inode validation is working :)
  this.errors = function(){
	var error_arr 	= new Array();	
	error_arr["MAN_NOCOMMAND"] = "command not found";
	return error_arr;
  }
  
  this.call = function(args){
  	 this.help = "displays help text";
	 this.helptext = "";
	 this.parameters = "[command]";
	 
	 var out = "<span class='info'>help";
     if(args[0]) out +=": "+args[0];
     out += "</span><br/><br/>";
     if(args[0] && !shell.commands.list[args[0]]){
		shell.errors.errindex = "MAN_NOCOMMAND";
		return this.fail("");
     }
     
     var out = this.drawHelp(args);
  	 shell.std.cout(out);
  }
  
  //
  this.fail = function(msg){
	shell.std.cerr(msg);
  }

  this.drawHelp = function(args){
	var module;
	var out = "<table border='0' class='help'>";
    out += "<tr class='help_header'><td class='less'>command</td><td class='less'>aliases</td><td class='less'>parameters</td><td class='less'>function</td></tr>";
	 for(key in shell.commands.list){
		if(!args[0] || key == args[0]) {
				module = shell.commands.list[key];
				out += "<tr><td";
				if(module.mode) out += " class='info'";
		 		out += ">";
				out += ""+module.name + "</td><td>";
				if(module.aliases.length >1){
					out += "(";
					for(i=0;i< module.aliases.length;i++){
		  				if(module.aliases[i] != module.name){
		  					out += module.aliases[i];
		  					out += ",";
		  				} // end if
					}// end for

					out = out.substr(0,out.length-1);
					out += ")";
				}// end if
				out += "</td><td>";
				if( module.parameters) out +=  module.parameters;
				out += "</td><td>";
				out += ""+ module.help +"\n";
				out += "</td></tr>";
	   	}// end if
    }// end for
  
	out += "</table>";
    if(args[0]){
    	out += " <br/>";
     	out += module.helptext;
     	out += " <br/>";
    }
    else{
     	out += " <br/>";
     	out += "- Aliases will expand to commands. <br/>";
     	out += "- Use cursor up and down for command history.<br/>";
    	out += "<br/>";
    }
    return out;
  }
}
shell.commands.require("man");