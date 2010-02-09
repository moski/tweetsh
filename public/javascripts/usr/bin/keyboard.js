/*
 *  keyboard.js
 *  Contains the main stuff required to interact with keyboard input/events.
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
};


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
};

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
};

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
  
  //if(keycode==9){
//	shell.keyboard.tabNav();	
 // }
		
//  if(keycode!=9 && keycode !=13) 
//   tweetShell.keyboard.autocompleteWord = tweetShell.helperGUI.inputField.val();

  if(keycode==13){
    shell.processInput();
  }
};


shell.keyboard.addNewCommandToHistory = function(cmd){
	if(cmd != "") {
    	shell.keyboard.history[shell.keyboard.history.length] = cmd;
    	shell.keyboard.historyPos = shell.keyboard.history.length;
  	}
};

shell.keyboard.getLatestCommandFromInput = function(){
	var input = shell.UI.inputField.val();
	
	// Get the last command from the input field
	// So if the cmd == "ls moski_doski | grep hello"
	// the command will be grep hello
	var cmd = input.split("|").pop();
	return ltrim(cmd);
};

shell.keyboard.keyDownHandler = function(event){
  if(!event&&window.event) {
    event=window.event;
  }
  if(event) {
    _lastKeyCode=event.keyCode;
  }
  // We are backspacing here...
  if(event && event.keyCode==9){
	event.cancelBubble=true;
    event.returnValue=false;
 	
	var input = shell.UI.inputField.val();
	var current_cursor_pos = shell.UI.inputField[0].selectionStart;
	
	//Get the prev pipe position
	var prev_pipe_pos = input.lastIndexOf("|") + 1;
	
	//we have the start index(prev_pipe_pos) && the stop index(current_cursor_pos) we can find the command
	var cmd = input.substring(prev_pipe_pos,current_cursor_pos);
	if(shell.keyboard.isDisplayCommands(cmd)){
		shell.keyboard.autoCompletePath(cmd , current_cursor_pos , prev_pipe_pos);
	}
	return false;
  }
};

// Given the current command, decide if the tab should display the list of command
// or it should list the files/folders in the current directory
shell.keyboard.isDisplayCommands = function(cmd){
	return (cmd.split(" ").length > 1);
};

shell.keyboard.autoCompletePath = function(cmd , current_cursor_pos , prev_pipe_pos){
	var cmd_arr = cmd.split(" ");
	
	var original_path = cmd_arr.pop();
	var path = original_path;
	if (shell.twitter_FS.isRelative(original_path)){
		path = shell.twitter_FS.expandPath(original_path);
	}
	var dirname  = shell.twitter_FS.dirname(path);
	var basename = shell.twitter_FS.basename(path);
	var node = shell.syscalls.path2Inode(dirname , "shell.callbacks.getUserTabCompletion");
	
	// if we have a valid twitter_FS NODE 
	if(!(node ==  shell.macros.FAIL ||  node == shell.macros.PENDING)) {
		// find all the matched paths
		var matched = shell.twitter_FS.filterChildren(node.children ,basename);
		
		// If we only matched one, them zoom to that one and autocomplete it.
		// If we matched none, then there is nothing to automeplete and just return
		if(matched.length == 0){
			return false;
		}else if(matched.length == 1){
			// only one match ... lets append it to the command
			shell.keyboard.updateCurrentInput(original_path ,matched[0].name , cmd_arr , cmd, true);
		}else{
			var shortest_name = shell.keyboard.shortestName(matched);
			shell.keyboard.updateCurrentInput(original_path ,shortest_name , cmd_arr , cmd , false);
			shell.std.coutWithQueueByPass(matched, shell.parsers.inodeArray);	
			shell.std.print("<br/>");
		}
	}
};

// Get the shortest name so we can tab to it.
// for example , if the folder contains the following subfolders ..
// ["by_me" , "by_moski" , "by_random"] .. then the shortest common path is by_
shell.keyboard.shortestName = function(children){
	var strings = shell.twitter_FS.getNamesFromInodes(children);
	var domi_index = strings[0].length;
	var expected_dom = true;
	var st_index = 0;

	while ((st_index < strings.length) && expected_dom){
	    var index = 0;
	    while(index < domi_index){
	        if (strings[st_index].charAt(index) == strings[0].charAt(index)){
	            index += 1;
	        }else{
	            if(index == 0)expected_dom = false;
	            domi_index = index;
	            break;
	        }
	    }
	    st_index += 1;
	}
	
	if(expected_dom){
	    return strings[0].substr(0, domi_index);
	}else{
		return null;
	}
};

shell.keyboard.updateCurrentInput = function(original_path ,matched , cmd_arr , cmd , match_one){
	var tmp = shell.twitter_FS.dirname(original_path,matched);
	var new_cmd =null;
	if(matched != null){
		if(tmp != original_path){
			new_cmd = shell.twitter_FS.join(tmp , matched); 
		}else{
			new_cmd = matched;
		}
		new_cmd = (match_one == true) ? (new_cmd + "/") : new_cmd;
		cmd_arr.push(new_cmd);
		shell.UI.RegReplaceInInput(cmd , cmd_arr.join(" "));
	}
};