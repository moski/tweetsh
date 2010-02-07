/*
 *  parsers.js
 *  Define all the parsers used in shell.std.cout
 *	 
 *   require 'shell.h.js'
 *   	
 */


shell.module("shell.parsers");
shell.parsers.inodeArray = function(arr){
	var out = '';
	for(var i=0; i < arr.length; i++){
		if(arr[i].name != '.' && arr[i].name != '..'){
			out += '<span class="dir">' + arr[i].name + "</span>";
		}
	}
	return out;
}

shell.parsers.Tweets = function(arr){
	var out = '<ol class="statuses" id="timeline">';
	for(var i=0; i < arr.length; i++){
		var data = arr[i];
		var parser = eval("shell.parsers." + data['json_class']);
		out += parser(data['data']);
	}
	out += '</ol>';
	return out;
}


shell.parsers.Tweet = function(tweet){
	var out = '<li id="status_' + tweet['id'] + '" class="hentry u-toot status">';
	out += '<span class="thumb vcard author"><a class="tweet-url profile-pic url" href="http://twitter.com/' + tweet['user']['screen_name'] + '">';
	out += '<img width="48" height="48" src="' + tweet['user']['profile_image_url'] + '" class="photo fn" alt="' + tweet['user']['name'] + '"></a></span>'
	out += '<span class="status-body"><strong><a title="' + tweet['user']['name'] + '" class="tweet-url screen-name" href="http://twitter.com/' + tweet['user']['screen_name'] + '">';
		out += tweet['user']['screen_name'] + "</a></strong>"; 
		out += ' <span class="entry-content">' +  jQuery.ify.clean(tweet['text']) + '</span>';
		out += ' <span class="meta entry-meta">';
			out += '<a href="http://twitter.com/' + tweet['user']['screen_name']  + '/status/' + tweet['id'] + '" rel="bookmark" class="entry-date">';
				out += '<span data="{time:\'' +  tweet['created_at'] + '\'" class="published timestamp">' + jQuery.relative_time(tweet['created_at']) +'</span>';
			out += '</a>';
			out += '<span> from ' + jQuery.unescapeHTML(tweet['source']) + ' </span>';
		out += '</span>';
	out += '</span>';
	out += '</li>';
	out = jQuery.hrefNewWindow(out);
	return out;
}

shell.parsers.Users = function(arr){
}

