/* Initilize the TweetShell Object and start extending it **/
var tweetShell = new Object();
tweetShell.helper = new Object();

/* Define a new module for each object to avoid conflicts **/
tweetShell.helper.module = function (ns){
  var parts = ns.split(".");
  var root = window;
  	
  for(var i=0; i<parts.length; i++){
    if(typeof root[parts[i]] == "undefined")
      root[parts[i]] = new Object();
    
	root = root[parts[i]];
  }
}

/* Extend the javascript to add the function include which checks if an array contains an element */
tweetShell.helper.arrayInclude = function (array , element){
  for (var i = 0; i < array.length; i++){
   	if (array[i] == element) return true;
  }
  return false;
}


/* Remove the leading and trailing whitespace only */
tweetShell.helper.chop = function(text){
	return $.trim(text);
}


tweetShell.helper.getAllCommandsWithaliases = function(){
	var arr = [];
	for(key in tweetShell.commands.list){
		arr = arr.concat(tweetShell.commands.list[key].aliases);
  	}
    return arr;
}




/** Define all the configurtion needed for tweetshell to work. **/
tweetShell.helper.module("tweetShell.configuration");

tweetShell.configuration.user = "guest";
tweetShell.configuration.host = "twitter.com";
tweetShell.configuration.mode = "help";
tweetShell.configuration.authencationMethod = null;

tweetShell.configuration.visitedProfiles = new Array();


tweetShell.configuration.pwd = "/";
tweetShell.configuration.oldPWD = null;

tweetShell.configuration.homeDir = '~';

tweetShell.configuration.numres = 10;
tweetShell.configuration.timeout = 4;
tweetShell.configuration.moreObject;
tweetShell.configuration.start=0;

tweetShell.configuration.urls = new Array();
tweetShell.configuration.cmdLines = new Array();
tweetShell.configuration.cmdHistory = new Array();


/******* To deal with piping ***/
tweetShell.configuration.execuationStackCommand = new Array();
tweetShell.configuration.execuationPipedData = null;



tweetShell.configuration.setPWD = function(newPWD){
	tweetShell.configuration.oldPWD = tweetShell.configuration.pwd
	tweetShell.configuration.pwd = newPWD;
}

// Switch to home Directory
tweetShell.configuration.setPWDHome = function(){
	tweetShell.configuration.setPWD(tweetShell.configuration.homeDir);
}

tweetShell.configuration.isExecuationStackCommandEmpty = function(){
	return tweetShell.configuration.execuationStackCommand.length == 0;
}


tweetShell.configuration.resetExecuationStack = function(){
	tweetShell.configuration.execuationStackCommand.length=0 // clear out the array
	tweetShell.configuration.execuationPipedData = null;
}


/** Starting the Gui interaction class */
tweetShell.helper.module("tweetShell.helperGUI");

/** initilize a starting point for all the values */
tweetShell.helperGUI.inputElement = false;
tweetShell.helperGUI.outputElement = false;
tweetShell.helperGUI.promptElement = false;

tweetShell.helperGUI.inputField = false;
tweetShell.helperGUI.bodyElement = false;


tweetShell.helperGUI.init = function(){
  tweetShell.helperGUI.inputElement  = $('#input');
  tweetShell.helperGUI.outputElement = $('#output');
  tweetShell.helperGUI.promptElement = $('#prompt');
  tweetShell.helperGUI.inputField    = $('#inputfield');
  tweetShell.helperGUI.bodyElement   = $('#body');
  
  /** initilize the events hooks **/
  tweetShell.helperGUI.inputField.keyup(function(event){  return tweetShell.keyboard.mcursor(event); });
  tweetShell.helperGUI.bodyElement.focus(function(event){ return tweetShell.helperGUI.focusCursor(event); });
  tweetShell.helperGUI.bodyElement.click(function(event){ return tweetShell.helperGUI.focusCursor(event); }); 
  tweetShell.helperGUI.bodyElement.keydown(function(event){ return tweetShell.keyboard.keyDownHandler(event); }); 
}

/** Deal with Errors ***/
tweetShell.helperGUI.error = function(text){
  //TODO
  //tweetShell.ajaxHelper.releaseAllRequests();

  tweetShell.helperGUI.puts("<span class='red'> Error: "+text+"<br/> </span>");
  tweetShell.helperGUI.focusCursor();
  tweetShell.helperGUI.showCursorInput();
  tweetShell.helperGUI.scroll();
}

/** Puts a text into the output Div by wrapping it into a div **/
tweetShell.helperGUI.puts = function(text){
  var div = '<div>' + text + '</div>';	
  tweetShell.helperGUI.outputElement.append(div);
}

tweetShell.helperGUI.putsWithNewLine = function(text){
	tweetShell.helperGUI.puts(text+"<br/>");  
}


tweetShell.helperGUI.renderData = function(data){
	if($.isArray(data)){
		tweetShell.helperGUI.renderTweets(data);
	}else{
		tweetShell.helperGUI.renderTweets([data])
	}
	tweetShell.helperGUI.updatePrompt();
}


tweetShell.helperGUI.renderDataUsers = function(data){
	if($.isArray(data)){
		tweetShell.helperGUI.renderUsers(data);
	}else{
		tweetShell.helperGUI.renderUsers([data])
	}
	tweetShell.helperGUI.updatePrompt();
}


tweetShell.helperGUI.renderTweets = function(data){
	// TODO: Add the user_id fot the tweets_for_
	var out = '<ul id="tweets_for_"' +  'class="tweets">';
	for (i = 0; i < data.length ; i++){
		out += tweetShell.helperGUI.renderTweet(data[i]);
	}
	out += "</ul>"
	tweetShell.helperGUI.puts(out);
}


tweetShell.helperGUI.renderUsers = function(data){
	var out = '<ul id="user_"' +  'class="tweets">';
	for (i = 0; i < data.length ; i++){
		out += tweetShell.helperGUI.renderUser(data[i]);
	}
	out += "</ul>"
	tweetShell.helperGUI.puts(out);
}

tweetShell.helperGUI.renderUser = function(user){
	var out = '<li id="user_' +  user.id  + '" class="user first parent">';	
	out += '<a name="user_' +  user.id + '" href="http://twitter.com/' + user.screen_name  + '">'; 
		out += '<img class="portrait" style="width: 48px; height: 48px;" src="'; 
		out += user.profile_image_url  + '" />';
	out += '</a>';
	
	out += '<div class="rightside">';
		out += '<div class="name">' + '<a href="http://twitter.com/' + user.screen_name  + '">' + user.screen_name + '</a>' ; 
		out += '</div>'; // end class="name"
		
		out += '<div class="loc">' + user.location +  '</div>';
		out += '<div class="text">' + user.status.text +  '</div>';
		
		out += '<div class="footnote">';
		  out+= '<strong>' + user.friends_count    + '</strong> following / ';
		  out+= '<strong>' + user.followers_count  +  '</strong> followers / ';
		  out+= '<strong>' + user.statuses_count   +  '</strong> updates / ';
		  out+= '<strong>' + user.favourites_count +  '</strong> favourites';
		out+= '</div>';
	out += '</div>'; // end class="rightside"	
	out += '<div class="clear"></div></li>';
	return out;
}


tweetShell.helperGUI.renderTweet = function(tweet){
	var out = '<li id="tweet_' +  tweet.id  + '" class="tweet first parent">';
	
	//out += '<span class="blue" id="' + tweet.id + '">/' + tweet.user.screen_name + '/' +tweet.id + " </span>";
	out += '<span class="blue" id="' + tweet.id + '">'   +	'<a href="http://twitter.com/' +  tweet.user.screen_name + '/status/' + tweet.id +  '">' + '/' + tweet.user.screen_name + '/' +tweet.id + '</a>' +  '</span>'; 
	
	out += '<a name="tweet_' +   tweet.id + '">'; 
		out += '<img class="portrait" style="width: 48px; height: 48px;" src="'; 
		out += tweet.user.profile_image_url  + '" />';
	out += '</a>';
	
	out += '<div class="rightside">';
		out += '<div class="name">' + '<a href="http://twitter.com/' + tweet.user.screen_name  + '">' + tweet.user.screen_name + '</a>' ; 
			out += ' - (' + tweet.created_at   + ')';
		out += '</div>'; // end class="name"
		
		out += '<div class="text">' + tweet.text  +  '</div>';
		
		
	out += '</div>'; // end class="rightside"
	
//    out += "<td valign='top' class='less'>&nbsp;&nbsp; <img src='"+  tweet.user.profile_image_url + "' />"  + "&nbsp;</td>"
	
	out += '<div class="clear"></div></li>'
	return out;
}

/** Clear the output Div **/
tweetShell.helperGUI.clear = function(){
  tweetShell.helperGUI.outputElement.html("");
}

/** Show the current Cursor **/
tweetShell.helperGUI.showCursorInput = function(){
  tweetShell.helperGUI.inputElement.css('display' , 'block');
}

/** Hide the current Cursor **/
tweetShell.helperGUI.hideCursorInput = function(){
  tweetShell.helperGUI.inputElement.css('display' , 'none');
}

/** Focus the current cursor **/
tweetShell.helperGUI.focusCursor = function(){
  var txt = "";
  if (document.selection) txt = document.selection.createRange().text;
  else if (window.getSelection) txt = window.getSelection().toString();

  if(txt.length == 0){
    document.f.q.value = document.f.q.value; // for safari
    if(tweetShell.helperGUI.inputElement.css("display") != "none") document.f.q.focus();
  }
}
/** TODO, fix me to get the correct user prompt **/
tweetShell.helperGUI.updatePrompt = function(){
  tweetShell.helperGUI.prompt = tweetShell.configuration.user +  '@twitter.com:' + tweetShell.helperGUI.generatePWD() + '>';
  tweetShell.helperGUI.promptElement.html(tweetShell.helperGUI.prompt);
}


tweetShell.helperGUI.generatePWD = function(){
	if (tweetShell.configuration.pwd == "/" || tweetShell.configuration.pwd == '~')
		return tweetShell.configuration.pwd;
	else
		return "/" + tweetShell.configuration.pwd;
}
tweetShell.helperGUI.scroll = function(){
  window.scrollBy(0, 122500);
}


tweetShell.helperGUI.scrollToCursor = function(){
  var pos = tweetShell.helperGUI.inputField.position();
  window.scrollBy(pos.left,pos.top);	
}







/** Deal with keyboard actions and trying to autocomplete actions **/
tweetShell.helper.module("tweetShell.keyboard");

tweetShell.keyboard.autocompletes = new Array();
tweetShell.keyboard.autocompletePosition = 1;
tweetShell.keyboard.autocompleteWord ="";

tweetShell.keyboard.history = new Array();
tweetShell.keyboard.historyPos = 0;
tweetShell.keyboard.historyTemp = 0;


tweetShell.keyboard.complete = function(word){
  if(tweetShell.keyboard.autocompletePosition > tweetShell.keyboard.autocompletes[word].length) tweetShell.keyboard.autocompletePosition =1;

  if(tweetShell.keyboard.autocompletes[word][tweetShell.keyboard.autocompletePosition]) 
    tweetShell.helperGUI.inputField.val(tweetShell.keyboard.autocompletes[word][tweetShell.keyboard.autocompletePosition]);

  var d= tweetShell.helperGUI.inputField; 
  if(d.createTextRange){
    var t=d.createTextRange();
    t.moveStart("character",word.length);
    t.select()
  } else if (d.setSelectionRange){
    d.setSelectionRange(word.length,d.value.length)
  }
}

tweetShell.keyboard.mcursor = function(e){
  var keycode=e.keyCode;	

  if(tweetShell.keyboard.history.length>0){
    if(keycode==38 || keycode==40){
      if(tweetShell.keyboard.history[tweetShell.keyboard.historyPos]) {
		tweetShell.keyboard.history[tweetShell.keyboard.historyPos] = tweetShell.helperGUI.inputField.val();
      }
      else{
		tweetShell.keyboard.historyTemp = tweetShell.helperGUI.inputField.val();
		
	  }
    }

    if(keycode==38){ // up
      tweetShell.keyboard.historyPos--;
      if(tweetShell.keyboard.historyPos<0) tweetShell.keyboard.historyPos =0;

    }
    else if(keycode==40){ //down

      tweetShell.keyboard.historyPos++;
      if(tweetShell.keyboard.historyPos > tweetShell.keyboard.history.length) 
        tweetShell.keyboard.historyPos = tweetShell.keyboard.history.length;
    } 

    if(keycode==38 || keycode==40){
      if(tweetShell.keyboard.history[tweetShell.keyboard.historyPos]) 
        tweetShell.helperGUI.inputField.val(tweetShell.keyboard.history[tweetShell.keyboard.historyPos]);
      else 
		tweetShell.helperGUI.inputField.val(tweetShell.keyboard.historyTemp);
    }
  }
  
  if(keycode==9){
	current_input = tweetShell.helperGUI.inputField.val();
	var tokens = current_input.split(" ");
	last = tokens.pop();
	
	
	var reg = new RegExp(last, "i");
	
	//var arr = tweetShell.commands.list.index_of(/current_input/);
	 var all_commands = tweetShell.helper.getAllCommandsWithaliases();
	
	
	var arr = jQuery.grep(all_commands, function(element){
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
			
			tweetShell.helperGUI.inputField.val(new_str);
		}else{
			var out = "<div class='input'><span class='less'>";
			out += tweetShell.helperGUI.prompt + "</span>";
			out += str + "</div>";
		    tweetShell.helperGUI.puts(out);
		}
	}
	
	}
		
  if(keycode!=9 && keycode !=13) 
   tweetShell.keyboard.autocompleteWord = tweetShell.helperGUI.inputField.val();

  if(keycode==13){
    tweetShell.exec();
  }
}


tweetShell.keyboard.keyDownHandler = function(event){
  
  if(!event&&window.event) {
    event=window.event;
  }
  if(event) {
    _lastKeyCode=event.keyCode;
  }
  // We are backspacing here...
  if(event&&event.keyCode==9){
	  
    event.cancelBubble=true;
    event.returnValue=false;
    // tab = 9, backsp = 8, ctrl =17, r = 82
    //output.innerHTML += event.keyCode+"<br/>";

    var word = tweetShell.keyboard.autocompleteWord;
/*    if(word !=""){
      if(!goosh.keyboard.suggestions[word]){
        goosh.keyboard.suggpos = 1;
//	output.innerHTML += "query<br/>";
	var script = document.createElement('script');
	document.body.appendChild(script);
	script.src = "http://www.google.com/complete/search?hl="+goosh.config.lang+"&js=true&qu="+encodeURIComponent(word);
      }
      else{
        goosh.keyboard.suggpos  +=2;
	goosh.keyboard.suggest(word);
      }
    }*/
    return false
  }
}



tweetShell.prepareForNextCommand = function(){
	tweetShell.helperGUI.scroll();
  	tweetShell.helperGUI.inputField.val('');

  	tweetShell.helperGUI.focusCursor();
	tweetShell.helperGUI.scrollToCursor();
	
	tweetShell.configuration.resetExecuationStack();
}

/** deals with a command failer **/
tweetShell.commandError = function(text){
	tweetShell.helperGUI.error(text);
	tweetShell.prepareForNextCommand();
	return;
}

tweetShell.exec = function(){
	/** get the current command from the input field */	
	var commandParameter = tweetShell.helperGUI.inputField.val();
	/** Generate all the tokens **/
	var tokens = commandParameter.split(" | ");
	for(i=0; i < tokens.length; i++){
		if(tokens[i] != "")
			tweetShell.configuration.execuationStackCommand.push(tokens[i]); // Push the command to the exectuation stack
	}
	
	/*** Preparign the UI for the new command **/
	cmdstrnew = tweetShell.helperGUI.inputField.val();
	window.location.hash = "#"+ encodeURIComponent(cmdstrnew);
  	var out = "<div class='input'><span class='less'>";
	out += tweetShell.helperGUI.prompt + "</span>";
	out += cmdstrnew + "</div>";
    tweetShell.helperGUI.puts(out);
	
	tweetShell.execCommand();
}

tweetShell.execCommand = function(){
	var commandParameter = tweetShell.configuration.execuationStackCommand.shift();
	
	/** Generate all the tokens **/
	var tokens = commandParameter.split(" ");
	
	/** Initilize a new array to contains all the passed args **/
	var args = new Array();
	
	/** Generate args from the passed tokens **/
  	for(i=0; i < tokens.length; i++){
    	if(tokens[i] != ""){
			args.push(tokens[i]);
    	} 
  	}
	
	// Push the piped data from the pimped command into the args
	if(tweetShell.configuration.execuationPipedData){
		args.push(tweetShell.configuration.execuationPipedData);
	}
	
	
	var searcher;
  	for(key in tweetShell.commands.list){
		if(tweetShell.helper.arrayInclude(tweetShell.commands.list[key].aliases ,args[0])){
      		searcher = tweetShell.commands.list[key];
      		args[0] = searcher.name;
      		break;
     	}
  	}
	
	cmdstrnew = tweetShell.helperGUI.inputField.val();

  	if(cmdstrnew != "") {
    	tweetShell.keyboard.history[tweetShell.keyboard.history.length] = cmdstrnew;
    	tweetShell.keyboard.historyPos = tweetShell.keyboard.history.length;
  	}
  	
    
	var cmd = ""; 

  	if(!searcher) {
     	searcher = tweetShell.commands.list[tweetShell.configuration.mode]; // default searcher = mode
  	}

  	else {
    	for(i=0; i<args.length-1; i++) args[i] = args[i+1];
    	args.pop();
  	}
   	
    searcher.call(args);
	
	/*if(tweetShell.configuration.isExecuationStackCommandEmpty()){
		searcher.render(tweetShell.configuration.execuationPipedData);
		tweetShell.helperGUI.scroll();
	  	tweetShell.helperGUI.inputField.val('');

	  	tweetShell.helperGUI.focusCursor();
		tweetShell.helperGUI.scrollToCursor();
	}*/
	return false;
}

/*** Dealing with All the available command **/
tweetShell.helper.module("tweetShell.commands");
tweetShell.helper.module("tweetShell.command");
tweetShell.helper.module("tweetShell.commandObj");

/** An array that holds all the commands  **/
tweetShell.commands.list = new Array();


/** Base Function to every command we define **/
tweetShell.command.base = function(){
  this.mode = false;
  this.parameters = "";
  this.help = "no helptext yet.";
  this.helpText = "";
  this.hasMore = false;
  this.results = new Array();
}

tweetShell.commands.require = function(name,base){
 if(!base) base = "base";  /** Set the default base function for the command unless the base is defined **/
  eval('tweetShell.command.'+name+'.prototype = new tweetShell.command.'+base+';'+
       'tweetShell.commandObj.'+name+' = new tweetShell.command.'+name+';'+
       'tweetShell.commands.list["'+name+'"] = tweetShell.commandObj.'+name+";");
}


/** define help **/
tweetShell.command.help = function(){
  this.name = "help";
  this.aliases = new Array("help","man","h","?");

  this.help = "displays help text";
  this.helptext = "";
  this.parameters = "[command]";

  this.call = function(args){
  	if(args[0] == "tweetShell") args[0] = false;

    var out = "<span class='info'>help";
    if(args[0]) out +=": "+args[0];
    out += "</span><br/> <br/>";
    if(args[0] && !tweetShell.commands.list[args[0]]) {
    	tweetShell.helperGUI.error(args[0]+": command not found ");

		tweetShell.prepareForNextCommand();

		return false;
    }
    
	
	
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
	tweetShell.helperGUI.putsWithNewLine(out);
	tweetShell.prepareForNextCommand();
  } // end this.call
} // end tweetShell.command.help
tweetShell.commands.require("help");

/** define clear **/
tweetShell.command.clear = function(){
  this.name = "clear";
  this.aliases = new Array("clear","c");
  this.help = "clear the screen";

  this.call = function(args){
  	tweetShell.helperGUI.clear();
	tweetShell.prepareForNextCommand();
  }
}
tweetShell.commands.require("clear");

/** define ls **/
tweetShell.command.ls = function(){
  this.name = "ls";
  this.aliases = new Array("ls");

  this.help = "list tweets for a a give path";
  this.helptext = "<span class='green'>If no operands are given, the contents of the current location are displayed.<br/>Calling <span class='blue'>ls /</span> will show the public time line and calling <span class='blue'> ls /moski_doski </span> will show the timeline for the user moski_doski.<br/> <p> If you are logged in (check <span class='blue'> man ssh</span>) then calling <span class='blue'>ls ~</span> will show your friends timeline.</p><p><span class='red'>*experimental:</span> You can use ls command with piping. For example to get the lastest tweet from moski_doski you can call <span class='blue'>ls /moski_doski | head </span></p>";


  this.helptext += "<p><span class='cool'>A really cool usage:</span> To copy the tweet from someone and resend it, its a one liner: <span class='blue'>ls /moski_doski | head | wall </span>. This will list moski_doski , get the latest tweet and post it again using the wall command. Cool stuff.</p>"
	
  this.parameters = "[screen_name]";
  
  renderLSTweets = function (data){
	// TODO: Add the user_id fot the tweets_for_
	var out = '<ul id="tweets_for_"' +  'class="tweets">';
	for (i = 0; i < data.length ; i++){
		out += tweetShell.helperGUI.renderTweet(data[i]);
	}
	out += "</ul>"
	tweetShell.helperGUI.puts(out);
  }
   
  this.call = function(args){
	var screen_name = '';
	var twCommand = '';
	
	var friends_timeline = false;
	
	if (args[0] == undefined || args[0] == '.'){
		screen_name = tweetShell.configuration.pwd
	}else{
		screen_name = args[0];
	}
	
	if (screen_name == '/'){
		twCommand = twitterApi.configuration.commands.lsTweetsPublicTimeLine;
	}
	else{
		if(screen_name == tweetShell.configuration.homeDir){
			screen_name = tweetShell.configuration.user;
			friends_timeline = true;
		}
			
			
		twCommand = twitterApi.configuration.commands.lsTweets;
	}	
	
	$.post('/twittercommands', {command : twCommand ,  screen_name: screen_name , friends_timeline : friends_timeline},this.callback, "json");
	  tweetShell.helperGUI.hideCursorInput();
  }
  
  this.callback = function(data){
   	if(twitterApi.actions.checkForExistence(data)){
		if(tweetShell.configuration.isExecuationStackCommandEmpty()){
			tweetShell.helperGUI.renderData(data);
			tweetShell.helperGUI.updatePrompt();
			tweetShell.prepareForNextCommand();
		}else{
			tweetShell.configuration.execuationPipedData = data;
			tweetShell.execCommand();
		}
	
	}else{
		return tweetShell.commandError("No such User or Tweet");
	}
	tweetShell.helperGUI.scrollToCursor();	
  }
}
tweetShell.commands.require("ls");


/** define cd **/
tweetShell.command.cd = function(){
  this.name = "cd";
  this.aliases = new Array("cd");

  this.help = "Change the working directory to the specified user";
  this.helptext = "";
  this.parameters = "screen name for the twitter user";

  this.call = function(args){
	var out ="";
	var screen_name = (args[0] == "-") ? tweetShell.configuration.oldPWD : args[0];
	
	// Deal with - becasue its the same everywhere
	if(args[0] == '-' && !tweetShell.configuration.oldPWD){
		return tweetShell.commandError('OLDPWD not set');
	}
	
	/** cd .. always goes to home **/
	if (args[0] == '..')
		screen_name = '/';
		
	/** cd . Do nothing actually **/
	if (args[0] == '.'){
		tweetShell.helperGUI.updatePrompt();
		tweetShell.helperGUI.scrollToCursor();
		return true;
	}
		
	/** 
	  No need for an ajax call when calling /, root always avaiable 
	  Go to to / if :
	   1. / was callded
	   2. not loggedin and called cd with no params 
	**/
	if (screen_name == "/" ||  (!twitterApi.actions.amILoggedIn() && !screen_name) || (!twitterApi.actions.amILoggedIn() && screen_name == tweetShell.configuration.homeDir  )){
		tweetShell.configuration.setPWD("/");
		tweetShell.helperGUI.updatePrompt();
		tweetShell.helperGUI.scrollToCursor();
		return true;
	}
	
	/** 
	  Logged and i want to go home, that can happen using the command styles:
	  cd
	  cd ~
	  cd myname
	**/
	if(twitterApi.actions.amILoggedIn() && (!screen_name || screen_name == tweetShell.configuration.homeDir || screen_name == tweetShell.configuration.user)){
		tweetShell.configuration.setPWDHome();
		tweetShell.helperGUI.updatePrompt();
		tweetShell.prepareForNextCommand();
		return true;
	}
	
	/*** At this point i have a screen name that i want to navigate to **/
	if ( tweetShell.helper.arrayInclude(tweetShell.configuration.visitedProfiles , screen_name)){
		//ok ive been here, its been validated, lets just switch to it.
		tweetShell.configuration.setPWD(screen_name);
		tweetShell.helperGUI.updatePrompt();
		tweetShell.prepareForNextCommand();
		return true;
	}
	
	var twCommand = twitterApi.configuration.commands.checkForExistence;
	$.post('/twittercommands', {command : twCommand ,  screen_name: screen_name},this.callback, "json");
	tweetShell.helperGUI.hideCursorInput(); // lock the request 
  }

  this.callback  = function(data){
 	if(twitterApi.actions.checkForExistence(data)){
		tweetShell.configuration.setPWD(data.screen_name);
		tweetShell.configuration.visitedProfiles.push(data.screen_name);
		tweetShell.prepareForNextCommand();
		tweetShell.helperGUI.updatePrompt();
		
	}else{
		tweetShell.commandError('No such User');
	}
  	tweetShell.helperGUI.scrollToCursor();  	
  }
}
tweetShell.commands.require("cd");

/** define pushd **/
tweetShell.command.pushd = function(){
  this.name = "pushd";
  this.aliases = new Array("pushd");

  this.help = "Go to a new user and push the current user onto a stack";
  this.helptext = "";
  this.parameters = "[username]";

  this.call = function(args){
	var out ="";
	
	var screen_name = (args[0] == "-") ? tweetShell.configuration.oldPWD : args[0];
	/** Check of the oldPWD been set **/
	if (!screen_name){
		tweetShell.helperGUI.error('OLDPWD not set');
		return;
	}
	/** no need for an ajax call when calling /, root always avaiable **/
	if (screen_name == "/"){
		tweetShell.command.pwdPushStack.push(tweetShell.configuration.pwd);
		tweetShell.configuration.setPWD("/");
		tweetShell.helperGUI.updatePrompt();
		return true;
	}
	
	var twCommand = twitterApi.configuration.commands.checkForExistence;
	$.post('/twittercommands', {command : twCommand ,  screen_name: screen_name},this.callback, "json");
	tweetShell.helperGUI.hideCursorInput(); // lock the request
  }

  this.callback = function(data){
	if(twitterApi.actions.checkForExistence(data)){
		tweetShell.command.pwdPushStack.push(tweetShell.configuration.pwd); 	// push the old value to the stack
		tweetShell.configuration.setPWD(data.screen_name);  // chnage the working dir
		tweetShell.helperGUI.updatePrompt();				// update the UI
		tweetShell.prepareForNextCommand();
	}else{
		return tweetShell.commandError('No such User or Tweet');
	}
	tweetShell.helperGUI.scrollToCursor();
  }


}
/** define popd **/
tweetShell.command.popd = function(){
  this.name = "popd";
  this.aliases = new Array("popd");

  this.help = "Pop a user from the stack and go to it";
  this.helptext = "";
  this.parameters = "N/A";

  this.call = function(args){
	var out ="";
	
	if (tweetShell.command.pwdPushStack.length == 0){
		tweetShell.helperGUI.error('directory stack empty');
		return;
	}
	
	var screen_name = tweetShell.command.pwdPushStack.pop();
	/** Check of the oldPWD been set **/
	if (!screen_name){
		tweetShell.helperGUI.error('OLDPWD not set');
		return;
	}
	
	/** no need for an ajax call when calling /, root always avaiable **/
	if (screen_name == "/"){
		tweetShell.configuration.setPWD("/");
		tweetShell.helperGUI.updatePrompt();
		return true;
	}
	
	var twCommand = twitterApi.configuration.commands.checkForExistence;
	$.post('/twittercommands', {command : twCommand ,  screen_name: screen_name},this.callback, "json");
	
	tweetShell.helperGUI.hideCursorInput(); // lock the request
  }
  
  this.callback = function(data){
	if(twitterApi.actions.checkForExistence(data)){
		tweetShell.configuration.setPWD(data.screen_name);  // chnage the working dir
		tweetShell.helperGUI.updatePrompt();				// update the UI
		tweetShell.prepareForNextCommand();
	}else{
		return tweetShell.commandError('No such User or Tweet');
	}
	tweetShell.helperGUI.scrollToCursor();
  }
}

tweetShell.command.pwdPushStack = new Array(); /** contains the stack of navigation information **/
tweetShell.commands.require("pushd");
tweetShell.commands.require("popd");

tweetShell.command.ssh = function(){
  this.name = "ssh";
  this.aliases = new Array("ssh" , "login");

  this.help = "login to your twitter account - <span class='green'>Oauth is highly recommended </span>";

  this.helptext = "You can login in to your twitter account using the following options:<br/>1. Basic <br/>";
  this.helptext += "I.  &nbsp;Email && Password:  <span class='blue'> ssh myemail@email.com -p password</span><br/>";
  this.helptext += "II. Login && Password:  <span class='blue'>  ssh -l login -p password </span><br/><br/>";
  this.helptext += "2. OAuth <br/>";
  this.helptext += "<span class='red'>HIGHLY RECOMMENDED AND MORE SECURE </span><span class='blue'>sh -i oauth </span>";
	
  this.parameters = "[-l login] [email] [-p password] [-i basic:oauth]";

  this.call = function(args){
	var out ="";
	
	var useP = false;
	var useL = false;
	var useEmail = false;
	
	var password = '';
	var emailOrlogin = '';
	
	var authentcationMethod = 'basic';
	
	
	for (i=0; i<args.length ; i++){
		/** Use -p option **/
		if (args[i] == '-p'){
			if(args[i+1] == undefined){
				tweetShell.helperGUI.error('option -p require an argument');
				return;
			}else{
				useP = true;
				password = args[i+1];
			}
		}
		
		/** check for email logins **/
		if (args[i].match(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/)){
			emailOrlogin =  args[i];
			useEmail = true;
		}// end if
		
		/** Use -i option **/
		if (args[i] == '-i'){
			if(args[i+1] == undefined){
				tweetShell.helperGUI.error('option -i require an argument');
				return;
			}else{
				if (!tweetShell.helper.arrayInclude(['basic' , 'oauth'] , args[i+1].toLowerCase())){
					tweetShell.helperGUI.error('option -i require an argument (basic or oauth)');
				}
				authentcationMethod = args[i+1].toLowerCase();
			}
		}
		
		/** Use -l option **/
		if (args[i] == '-l'){
			if(args[i+1] == undefined){
				tweetShell.helperGUI.error('option -l require an argument');
				return;
			}else{
				useL = true;
				emailOrlogin = args[i+1];
			}
		}
	}//end for
	
	if (authentcationMethod == 'oauth'){
		this.oauth();
	}else{
		this.basic(useP , useL , useEmail , emailOrlogin , password);
	}
  }	

  this.oauth = function(){
  	window.location = "/login";
	tweetShell.helperGUI.hideCursorInput(); // lock the request
  }

  this.basic = function(useP , useL , useEmail , email , password){
	/** ok if we have the password and the username we are ready to go **/
	if(useP && (useL || useEmail)){

		var twCommand = twitterApi.configuration.commands.login;
		$.post('/twittercommands', {command : twCommand ,  email: email , password: password},this.callback, "json");
		  
		  tweetShell.helperGUI.hideCursorInput(); // lock the request
			
	}else{
		tweetShell.commandError('invalid usage of ssh');
	}// end else
	
  }// end basic

  this.callback = function(data){
	if(twitterApi.actions.checkForExistence(data)){
		tweetShell.configuration.user = data.screen_name;
		tweetShell.configuration.setPWDHome();
		tweetShell.configuration.authencationMethod = 'basic';
		tweetShell.helperGUI.updatePrompt();
		tweetShell.prepareForNextCommand();
	}else{
		return tweetShell.commandError('Permission denied, Invalid user or password');
	}
	tweetShell.helperGUI.scrollToCursor();
  } // end callback
	
}// end function tweetShell.command.ssh	
tweetShell.commands.require("ssh");

tweetShell.command.exit = function(){
  this.name = "exit";
  this.aliases = new Array("exit" , "logout");

  this.help = "logout from your twitter account";

  this.helptext = "Termimate your current session with twitter.com";
	
  this.parameters = "N/A";

  this.call = function(args){
	var out ="exiting twitter.com";
	
	if(tweetShell.configuration.authencationMethod == 'oauth'){
		window.location = "/logout";
	}else{
		var twCommand = twitterApi.configuration.commands.logout;
		$.post('/twittercommands', {command : twCommand },this.callback, "json");
		  tweetShell.helperGUI.hideCursorInput(); // lock the request
	}
	tweetShell.helperGUI.hideCursorInput(); // lock the request
  }
  
  this.callback = function(data){
 	if(twitterApi.actions.checkForExistence(data)){
		tweetShell.configuration.user = 'guest';
		tweetShell.configuration.authencationMethod = null;
		tweetShell.helperGUI.updatePrompt();
		tweetShell.prepareForNextCommand();
	}else{
		tweetShell.helperGUI.error('something went wrong, please try again in few seconds');
	}
	tweetShell.helperGUI.scrollToCursor(); 	
  }
 
}
tweetShell.commands.require("exit");


tweetShell.command.wall = function(){
  this.name = "wall";
  this.aliases = new Array("wall" , "tweet");

  this.help = "Write a message to all followers.(tweeting)";
  this.helptext = "Wall pushs your current tweet to all your followers<br/>";
  this.helptext += "<span class='green'>  Your must be logged in to use it, please chech ssh command </span><br/>"
  this.helptext += "<p><span class='red'>*experimental:</span> You can use wall command with piping. For example to push a tweet as your own tweet, you can do the following <span class='blue'>cat /moski_doski/3241964836 | wall </span></p>"  

  this.parameters = "[tweet]";

  this.call = function(args){
	var out = 'tweeting';
	
	if (!twitterApi.actions.amILoggedIn()){
		return tweetShell.commandError('You must be logged in to use this command. try to run <span class="blue"> ssh -i oauth  </span>  to login');
    }
	
	if(!args[0] || args[0].length <= 0){
		return tweetShell.commandError('wall takes a tweet argument');
		return;
	}
	
	var tweet = '';
	
	/** the incoming data is from a pipe which is a tweet**/
	if($.isArray(args[0])){
		tweet = args[0][0].text;
	}else{
		for (var i = 0; i < args.length; i++){
		  tweet += args[i] + ' ';
		}
	}
	
	if(tweet.length >= 141){
		tweetShell.commandError('wall only sends 140 chars. current usage is ' + tweet.length);
		return;
	}
	
	var twCommand = twitterApi.configuration.commands.postTweet;
	$.post('/twittercommands', {command : twCommand ,  tweet: tweet},this.callback, "json");
	tweetShell.helperGUI.hideCursorInput(); // lock the request
  }
 
  this.callback = function(data){
 	if(twitterApi.actions.checkForExistence(data)){
		if(tweetShell.configuration.isExecuationStackCommandEmpty()){
			tweetShell.helperGUI.updatePrompt();
			tweetShell.prepareForNextCommand();
		}else{
			tweetShell.configuration.execuationPipedData = '';
			tweetShell.execCommand();
		}
	}else{
		return tweetShell.commandError('Permission denied, Invalid user or password');
	}
  }
}
tweetShell.commands.require("wall");


tweetShell.command.tail = function(){
  this.name = "tail";
  this.aliases = new Array("tail");

  this.help = "display the last part of a list of tweets";
  this.helptext = "The tail utility displays the contents of tweet,  by default, its used with piping as a filter";
  this.helptext += "<p><span class='red'> Currently ONLY working with other commands using pipes </span></p>"
  
  this.parameters = "[input]";

  this.call = function(args){
	var data = null;
	var index = 1;
	if(!args || args.length == 0){
		return tweetShell.commandError("tail requires an input");
	}
	
	for(i=0; i < args.length; i++){
		if (args[i] == '-n'){
			if(!args[i+1]){
				return tweetShell.commandError("-n option require an argument");
			}
			index = args[i+1]
		}else{
			data = args[i];
		} 
	}
	
	try{
		new_data = data.slice(data.length - index, data.length);
	}catch(err){
		
		new_data = [];
	}
	
	if(tweetShell.configuration.isExecuationStackCommandEmpty()){
		tweetShell.helperGUI.renderData(new_data);
		tweetShell.helperGUI.updatePrompt();
		tweetShell.prepareForNextCommand();
	}else{
		tweetShell.configuration.execuationPipedData = new_data;
		tweetShell.execCommand();
	}
  }
}
tweetShell.commands.require("tail");


tweetShell.command.head = function(){
  this.name = "head";
  this.aliases = new Array("head");

  this.help = "display first lines of a tweets";
  this.helptext = "This filter displays the first count lines of each of the specified tweets. If count is omitted it defaults to 1";
  this.helptext += "<p><span class='red'> Currently ONLY working with other commands using pipes </span></p>"
  
  this.parameters = "[input]";

  this.call = function(args){
	var data = null;
	var index = 1;
	if(!args || args.length == 0){
		return tweetShell.commandError("head requires an input");
	}
	
	for(i=0; i < args.length; i++){
		if (args[i] == '-n'){
			if(!args[i+1]){
				return tweetShell.commandError("-n option require an argument");
			}
			index = args[i+1]
		}else{
			data = args[i];
		} 
	}
	
	new_data = data.slice(0,index);
	
	if(tweetShell.configuration.isExecuationStackCommandEmpty()){
		tweetShell.helperGUI.renderData(new_data);
		tweetShell.helperGUI.updatePrompt();
		tweetShell.prepareForNextCommand();
	}else{
		tweetShell.configuration.execuationPipedData = new_data;
		tweetShell.execCommand();
	}
  }
}
tweetShell.commands.require("head");

tweetShell.command.cat = function(){
  this.name = "cat";
  this.aliases = new Array("cat");

  this.help = "The cat utility reads tweets sequentially, writing them to the standard output.";
  this.helptext = "<span class='green'>Given the tweet ID or URL print the tweet to the screen or push it into a pipe.<br/>You can print multiple tweets at one time for example the command <span class='blue'>cat /kimo79/3312644725 /f10i/3282726414 3281241063</span> will print these three statuses to the screen. Please note that we are using a relative path for the tweet 3281241063 meaning we are standing in the parent directory :/moski_doski>.</span>";
  
  this.helptext += "<p> <span class='green'> Cat supports the * . symbols. For example assuming u are standing at the / then <span class='blue'> cat * </span> will print the lastest 20 tweets. </span></p>"
  
   this.helptext += "<p><span class='red'>*experimental:</span> You can use cat command with piping. For example <span class='blue'> cat * | head </span> will output the lastest tweet depending on the current standing directory</p>"  
  
 	
  this.parameters = "[tweet_path]";

  this.call = function(args){
	url = args[0];
	
	if(!args || args.length == 0){
		return tweetShell.commandError("cat requires an input");
	}
	
	 
	var twCommand = twitterApi.configuration.commands.catTweet;
	$.post('/twittercommands', {command : twCommand ,  'urls[]': args , pwd:tweetShell.helperGUI.generatePWD},this.callback, "json");
	tweetShell.helperGUI.hideCursorInput(); // lock the request
  }

  this.callback = function(data){
	if(twitterApi.actions.checkForExistence(data)){
		if(tweetShell.configuration.isExecuationStackCommandEmpty()){
			tweetShell.helperGUI.renderData(data);
			tweetShell.helperGUI.updatePrompt();
			tweetShell.prepareForNextCommand();
		}else{
			tweetShell.configuration.execuationPipedData = data;
			tweetShell.execCommand();
		}
	}else{
		return tweetShell.commandError('Permission denied, Invalid user or password');
	}
  }

}

tweetShell.commands.require("cat");

tweetShell.command.ln = function(){
  this.name = "ln";
  this.aliases = new Array("link" , "ln");

  this.help = "The ln utility creates a new follower entry.";
  this.helptext = "To follow a new user giving the username/screen_name do   <span class='blue'> ln Username </span>";
  this.helptext += "<p> <span class='red'> NO support for piping yet </p>"  ;

  this.parameters = "[source]";

  this.call = function(args){
  	if (!twitterApi.actions.amILoggedIn()){
		return tweetShell.commandError('You must be logged in to use this command. try to run <span class="blue"> ssh -i oauth  </span>  to login');
    }

	if (!args || args.length == 0){
		return tweetShell.commandError('invalid source link, example: <span class="blue"> ln moski_doski </span> ');
	}
	
	follow = args[0];
	var twCommand = twitterApi.configuration.commands.followUser;
	$.post('/twittercommands', {command : twCommand ,  username : follow},this.callback, "json");
	
	tweetShell.helperGUI.hideCursorInput(); // lock the request
  }
  this.callback = function(data){
	if(twitterApi.actions.checkForExistence(data)){
		tweetShell.helperGUI.updatePrompt();
		tweetShell.prepareForNextCommand();
	}else{
		return tweetShell.commandError(data.error);
	}
  }
}
tweetShell.commands.require("ln");

tweetShell.command.unlink = function(){
	this.name = "unlink";
	this.aliases = new Array("unlink");

	this.help = "The unlink utility removes a follower ";
	this.helptext = "To unfollow a user giving the username/screen_name do   <span class='blue'> unlink Username </span>";
	this.helptext += "<p> <span class='red'> NO support for piping yet </p>"  ;

	this.parameters = "[source]";

	this.call = function(args){
		
		if (!twitterApi.actions.amILoggedIn()){
			return tweetShell.commandError('You must be logged in to use this command. try to run <span class="blue"> ssh -i oauth  </span>  to login');
	    }

		if (!args || args.length == 0){
			return tweetShell.commandError('invalid source link, example: <span class="blue"> ln moski_doski </span> ');
		}

		follow = args[0];
		var twCommand = twitterApi.configuration.commands.unfollowUser;
		$.post('/twittercommands', {command : twCommand ,  username : follow},this.callback, "json");

		tweetShell.helperGUI.hideCursorInput(); // lock the request	
	}
	
	this.callback = function(data){
		if(twitterApi.actions.checkForExistence(data)){
			tweetShell.helperGUI.updatePrompt();
			tweetShell.prepareForNextCommand();
		}else{
			return tweetShell.commandError(data.error);
		}
	}
}
tweetShell.commands.require("unlink");

tweetShell.command.finger = function(){
	this.name = "finger";
	this.aliases = new Array("finger");

	this.help = "The finger utility displays information about a twitter user";
	this.helptext = "<span class'green'> Sample usage: <span class='blue'>finger Jessicasimpson</span></span>";
	this.helptext += ""  ;
	this.parameters = "[username]";

	this.call = function(args){
		if (!args || args.length == 0){
			return tweetShell.commandError('fingre require username, example: <span class="blue"> finger Jessicasimpson </span>  ');
		}
		var screen_name = args[0];
		
		var twCommand = twitterApi.configuration.commands.finger;
		$.post('/twittercommands', {command : twCommand ,  screen_name: screen_name},this.callback, "json");
		tweetShell.helperGUI.hideCursorInput(); // lock the request
	}
	this.callback = function(data){
		if(twitterApi.actions.checkForExistence(data)){
			tweetShell.configuration.visitedProfiles.push(data.screen_name);
			tweetShell.helperGUI.renderDataUsers(data);
			tweetShell.prepareForNextCommand();
			tweetShell.helperGUI.updatePrompt();
		}else{
			tweetShell.commandError(data.error);
		}
	  	tweetShell.helperGUI.scrollToCursor();
	}
}
tweetShell.commands.require("finger");