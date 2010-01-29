/*
 *  shell.js
 *  Contains the main stuff required to interact with the shell.
 *  Copyright 2010 Monther. All rights reserved.
 *	 
 *   require 'shell.h.js'
 *   require 'keyboard.js'
 *   	
 */

/* Lets do this , intilialize the entire system **/
shell.initialize = function(){
	shell.twitter_FS.initialize();
	shell.UI.initialize();
}

/* Define all the configurtion needed for shell to work. **/
shell.module("shell.config");

shell.config.user = "guest";
shell.config.host = "twitter.com";
shell.config.mode = "help";


/* An array to save the visited profile, to save the extra ajax queries **/
shell.config.visitedProfiles = new Array();

/* Deals with the shell DOM reference **/
shell.module("shell.UI");

/* Initialize the UI engine **/
shell.UI.initialize = function(){
	// Find my main dom elements
	shell.UI.bodyElement   = $('#body');
	shell.UI.inputElement  = $('#input');
	shell.UI.promptElement = $('#prompt');
	shell.UI.inputField    = $('#inputfield');
	shell.UI.outputElement = $('#output');
	
	// hook my events
	shell.UI.hookEvents();

	shell.UI.setPrompt();
	
	shell.UI.showInput();
	
	shell.UI.focusCursor();
}

shell.UI.hookEvents = function(){
  shell.UI.inputField.keyup(function(event)   { return shell.keyboard.mcursor(event); });
  shell.UI.bodyElement.focus(function(event)  { return shell.UI.focusCursor(event); });
  shell.UI.bodyElement.click(function(event)  { return shell.UI.focusCursor(event); }); 
  //shell.UI.bodyElement.keydown(function(event){ return tweetShell.keyboard.keyDownHandler(event); }); 
}

/*  give the current input the cursor focus */
shell.UI.focusCursor = function(){
  var txt = "";
  if (document.selection) txt = document.selection.createRange().text;
  else if (window.getSelection) txt = window.getSelection().toString();

  if(txt.length == 0){
    document.f.q.value = document.f.q.value; // for safari
    if(shell.UI.inputElement.css("display") != "none") document.f.q.focus();
  }
}

/* Scroll the window to the input cursor */
shell.UI.scrollToCursor = function(){
  var pos = shell.UI.inputField.position();
  window.scrollBy(pos.left,pos.top - 10);	
}
shell.UI.scroll = function(){
  window.scrollBy(0, 122500);
}

/* Setters and getters for prompt **/
shell.UI.getPrompt = function(){
	return shell.UI.promptElement.html();
}
shell.UI.setPrompt = function(){
	//var html = shell.config.user +  '@twitter.com:' + tweetShell.helperGUI.generatePWD() + '>';
	var html = shell.config.user +  '@twitter.com:' + shell.syscalls.getPWD()  + '>';
	shell.UI.promptElement.html(html);
}

shell.UI.showInput = function(){
	shell.UI.inputElement.css('display' , 'block');
}
shell.UI.hideInput = function(){
	shell.UI.inputElement.css('display' , 'none');
}

/* Get the shell UI ready for the next command **/
shell.UI.prepareForNextCommand = function(){
	//shell.UI.scroll();
  	shell.UI.inputField.val('');

  	shell.UI.focusCursor();
//	shell.UI.scrollToCursor();
}

shell.processInput = function(){
	/* get the current command from the input field */	
	var command = shell.UI.inputField.val();
	
	/* Generate all the tokens **/
	var tokens = command.split(" | ");
	for(i=0; i < tokens.length; i++){
		if(tokens[i] != "")
			shell.pipe.callQueue.push(tokens[i]);
	}
	
	/* Preparign the UI for the new command **/
	window.location.hash = "#"+ encodeURIComponent(command);

 	shell.std.echoInput();

	shell.keyboard.addNewCommandToHistory(command);
	shell.exec();
}
shell.exec = function (){
	/* Get the command that i need to exectue **/
	var command = shell.pipe.callQueueNext();
	
    /*  Generate all the tokens.
	 *  For example:  ls moski_doski ==> ['ls' , 'moski_doski']
	 */
	var args = command.split(" ");
	args = jQuery.ArrayCompact(args)	
	 
	/* Push the data from previous piped command as an argument/input **/
	if(shell.pipe.dataOnPipe){
		args.push(shell.pipe.dataOnPipe);
	}
	
	/* Find the commandObj so we can call it **/
	var commandObj = shell.commands.findCommand(args[0]);
	
	if(commandObj == null) {
     	/*  Load the default command, if no command is find **/
		commandObj = shell.commands.list[shell.config.mode];
	}else{
  		/*  @ this point we have the commandObj, so no need for the first arg which is the command name **/
		args.shift();
	}
	
	// Lets call this baby
	commandObj.call(args);
	return false;
}


/* Get the shell ready for the next command **/
shell.prepareForNextCommand = function(){
	shell.UI.prepareForNextCommand();
	shell.pipe.resetCallQueueEmpty();
}