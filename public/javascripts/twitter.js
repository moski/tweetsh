var twitterApi = new Object();
twitterApi.helper = new Object();


/* Define a new module for each object to avoid conflicts **/
twitterApi.helper.module = function (ns){
  var parts = ns.split(".");
  var root = window;
  	
  for(var i=0; i<parts.length; i++){
    if(typeof root[parts[i]] == "undefined")
      root[parts[i]] = new Object();
    
	root = root[parts[i]];
  }
}

twitterApi.helper.module("twitterApi.configuration.urls");
twitterApi.helper.module("twitterApi.configuration.commands");



/** The url used to check the exitence of a user **/
twitterApi.configuration.urls.checkForExistence = 'http://twitter.com/users/show.json?';


twitterApi.configuration.commands.checkForExistence = 'checkForExistence';
twitterApi.configuration.commands.lsTweets = 'lsTweets';
twitterApi.configuration.commands.lsTweetsPublicTimeLine = 'lsTweetsPublicTimeLine';

twitterApi.configuration.commands.login = 'loginToTwitter';
twitterApi.configuration.commands.logout = 'logoutFromTwitter';
twitterApi.configuration.commands.postTweet = 'postTweet';
twitterApi.configuration.commands.catTweet = 'catTweet';
twitterApi.configuration.commands.followUser = 'followUser'
twitterApi.configuration.commands.unfollowUser = 'unfollowUser'
twitterApi.configuration.commands.finger = 'checkForExistence'


twitterApi.helper.module("twitterApi.actions");

/** Handels the parsing of response data for user existence */
twitterApi.actions.checkForExistence = function(data){
	tweetShell.helperGUI.showCursorInput();
	if (data.error){
		return false;
	}else{
		return true;
	}
}

twitterApi.actions.checkls = function(data){
	tweetShell.helperGUI.showCursorInput();
	if (data.error){
		return false;
	}else{
		return true;
	}
}

twitterApi.actions.amILoggedIn = function(){
	return (tweetShell.configuration.user != 'guest' && (tweetShell.configuration.authencationMethod == 'oauth' || tweetShell.configuration.authencationMethod == 'basic'));
}