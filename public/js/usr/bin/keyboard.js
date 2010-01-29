/*
 *  keyboard.js
 *  Contains the main stuff required to interact with keyboard input/events.
 *  Copyright 2010 Monther. All rights reserved.
 *	 
 *   require 'shell.h.js'
 *   	
 */
shell.module("shell.keyboard");

shell.keyboard.autocompletes = new Array();
shell.keyboard.autocompletePosition = 1;
shell.keyboard.autocompleteWord ="";

shell.keyboard.history = new Array();
shell.keyboard.historyPos = 0;
shell.keyboard.historyTemp = 0;


// If we are are not outside the shell.keyboard.history boundries means we are
// navigating throw an old command, so update the command from the textfield. Otherwise
// save the command into a tmp var
shell.keyboard.saveCurrentInput = function(){
	if(shell.keyboard.history[shell.keyboard.historyPos]) {
		shell.keyboard.history[shell.keyboard.historyPos] = shell.UI.inputField.val();
    }
    else{
		shell.keyboard.historyTemp = shell.UI.inputField.val();	
    }
}


// Deals with the up/down history navigation.
shell.keyboard.upDownHistoryNav = function(keycode){
	if(keycode == 38 || keycode == 40){
		shell.keyboard.saveCurrentInput();
    }
	
	// Move the pointer to the previous element and make sure 
	// we don't go outofbond
    if(keycode == 38){ // up
      shell.keyboard.historyPos--;
      if(shell.keyboard.historyPos< 0) shell.keyboard.historyPos =0;

    }

	// Move the pointer to the next element and make sure 
	// we don't go outofbond
    else if(keycode==40){ //down
      shell.keyboard.historyPos++;
      if(shell.keyboard.historyPos > shell.keyboard.history.length) 
        shell.keyboard.historyPos = shell.keyboard.history.length;
    } 

    if(keycode==38 || keycode==40){
      if(shell.keyboard.history[shell.keyboard.historyPos]) 
        shell.UI.inputField.val(shell.keyboard.history[shell.keyboard.historyPos]);
      else 
		shell.UI.inputField.val(shell.keyboard.historyTemp);
    }
}

shell.keyboard.tabNav = function(){
	var current_input = shell.UI.inputField.val();
	var tokens = current_input.split(" ");
	last = tokens.pop();
	
	var reg = new RegExp(last, "i");
		
	var arr = jQuery.grep(shell.commands.listWithAlias(), function(element){
			return reg.exec(element);
	});
	
	if (arr.length > 0){
		str =  arr.join(" ");
		if (arr.length == 1){
			var new_str = tokens.join(" ");
			if (new_str.length == 0){
				new_str = arr[0]  + ' ';
			}else{
				new_str = new_str + ' ' + arr[0]  + ' ';
			}
			shell.UI.inputField.val(new_str);
		}else{
			// This should not be here, move this into a helper
			var out = "<div class='input'><span class='less'>";
			out += shell.UI.getPrompt() + "</span>";
			out += str + "</div>";
		    //tweetShell.helperGUI.puts(out);
			//@TODO: Deal with shell.std.cout
		}
	}
}

// Handel keyboard events
// NOTEs:
//	keycode == 38 == up
//	keycode == 40 == down
//	keycode == 9  == tab
//	keycode == 13 == enter	
shell.keyboard.mcursor = function(e){
  var keycode = e.keyCode;	

  // if there is a history	
  if(!jQuery.isEmpty(shell.keyboard.history)){
    shell.keyboard.upDownHistoryNav(keycode);
  }
  
  if(keycode==9){
	shell.keyboard.tabNav();	
  }
		
//  if(keycode!=9 && keycode !=13) 
//   tweetShell.keyboard.autocompleteWord = tweetShell.helperGUI.inputField.val();

  if(keycode==13){
    shell.processInput();
  }
}


shell.keyboard.addNewCommandToHistory = function(cmd){
	if(cmd != "") {
    	shell.keyboard.history[shell.keyboard.history.length] = cmd;
    	shell.keyboard.historyPos = shell.keyboard.history.length;
  	}
}