/*
 *  iostream.js
 *  Maintains a refernce to the current input/output stream.
 *	 
 *   require 'shell.h.js'
 *   require 'keyboard.js'
 *   	
 */

/* namespace for the std stuff **/
shell.module("shell.std");

shell.std.cout = function (data, parser){
	// If nothing on the pipe, then print to the screen
	// other wise deal with the pipe stuff 
	if (shell.pipe.callQueueEmpty()){
		var parsed_data = (parser == null ? data : parser(data));	
		shell.std.print(parsed_data);
	}else{
		shell.pipe.dataOnPipe = new dataOnPipe_struct(data, parser);
		shell.exec();
	}
};

shell.std.echoInput = function (){
	var out = "<div class='input sexy'><span class=''>";
	out += shell.UI.getPrompt() + "</span><span class='commands'>";
	out += shell.UI.inputField.val() + "</span></div>";
    shell.std.print(out);
};

/* Standard Error **/
shell.std.cerr = function(data){
	output = '<div class="error">' + shell.errors.errors[shell.errors.errindex] + data + "</div>";
	shell.std.print(output);
	shell.errors.errindex = null;
};

/* Standard Logging: Use the mighty firebug for debugging .... fb i luvvvv uuuuuuuuu  **/
shell.std.clog = function(data){
	if (console && typeof console.log == "function"){
		console.log(data);
	}
};

/* Clear the STD output **/
shell.std.clear = function (data){
	shell.UI.outputElement.html('');
};

shell.std.print = function (data){
	shell.UI.outputElement.append(data);
};