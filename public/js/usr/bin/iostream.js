/*
 *  iostream.js
 *  Maintains a refernce to the current input/output stream.
 *  Copyright 2010 Monther. All rights reserved.
 *	 
 *   require 'shell.h.js'
 *   require 'keyboard.js'
 *   	
 */


/* namespace for the std stuff **/
shell.module("shell.std");

shell.std.count = function (data){
	// If nothing on the pipe, then print to the screen
	// other wise deal with the pipe stuff 
	if (shell.pipe.callQueueEmpty()){
		shell.std.print(data);
	}else{
		
	}
}

shell.std.echoInput = function (){
	var out = "<div class='input sexy'><span class=''>";
	out += shell.UI.getPrompt() + "</span><span class='commands'>";
	out += shell.UI.inputField.val() + "</span></div>";
    shell.std.print(out);
}

/* Clear the STD output **/
shell.std.clear = function (data){
	shell.UI.outputElement.html('');
}

shell.std.print = function (data){
	shell.UI.outputElement.append(data);
}