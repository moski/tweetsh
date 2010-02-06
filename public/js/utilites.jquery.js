/*
 *  utilities.jquery.js
 *  Contains helpful function built on top of jquery
 *  Copyright 2010 Monther. All rights reserved.
 *
 */
jQuery.isValueIncludedInArray =  function(value, array) {
	return jQuery.inArray(value, array) > -1;
};

jQuery.isEmpty =  function(array) {
	return array.length == 0;
};

/* Remove all the white spaces from an array of strings */
jQuery.ArrayCompact =  function(array) {
	return jQuery.ArrayRemoveElement(array , "");
};

/* Remove all matching elements from an array */
jQuery.ArrayRemoveElement =  function(array , element) {
	array = jQuery.grep(array, function(value) {
	        return value != element;
	});
	return array
};

/* copy associative array. 
   This will of course overwrite existing keys in destination which have counterparts in source.	
**/
jQuery.ArrayCopyAssociative =  function(destination , source) {
	for (attr in source) { destination[attr] = source[attr]; }
};

jQuery.ArrayHasKey =  function(array , key) {
	return (array[key] != undefined);
};


/* create a new struct structure based on http://stackoverflow.com/questions/502366/structs-in-javascript **/
jQuery.makeStruct = function(names) {
  var names = names.split(' ');
  var count = names.length;
  function constructor() {
    for (var i = 0; i < count; i++) {
      this[names[i]] = arguments[i];
    }
  }
  return constructor;
}


jQuery.ify = function() {
  var entities = {
      '"' : '&quot;',
      '&' : '&amp;',
      '<' : '&lt;',
      '>' : '&gt;'
  };

  return {
    "link": function(t) {
      return t.replace(/[a-z]+:\/\/[a-z0-9-_]+\.[a-z0-9-_:~%&\?\/.=]+[^:\.,\)\s*$]/ig, function(m) {
        return '<a href="' + m + '">' + ((m.length > 25) ? m.substr(0, 24) + '...' : m) + '</a>';
      });
    },
    "at": function(t) {
      return t.replace(/(^|[^\w]+)\@([a-zA-Z0-9_]{1,15})/g, function(m, m1, m2) {
        return m1 + '@<a href="http://twitter.com/' + m2 + '">' + m2 + '</a>';
      });
    },
    "hash": function(t) {
      return t.replace(/(^|[^\w'"]+)\#([a-zA-Z0-9_]+)/g, function(m, m1, m2) {
        return m1 + '#<a href="http://search.twitter.com/search?q=%23' + m2 + '">' + m2 + '</a>';
      });
    },
    "clean": function(tweet) {
      return this.hash(this.at(this.link(tweet)));
    }
  };
}();

jQuery.hrefNewWindow = function(str){
	return str.replace(/<a href/gi, '<a target="_blank" href');
}

jQuery.relative_time = function(time_value) {
    var values = time_value.split(" "),
        parsed_date = Date.parse(values[1] + " " + values[2] + ", " + values[5] + " " + values[3]),
        date = new Date(parsed_date),
        relative_to = (arguments.length > 1) ? arguments[1] : new Date(),
        delta = parseInt((relative_to.getTime() - parsed_date) / 1000),
        r = '';
    
	var monthDict = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		

    function formatTime(date) {
        var hour = date.getHours(),
            min = date.getMinutes() + "",
            ampm = 'AM';
        
        if (hour == 0) {
            hour = 12;
        } else if (hour == 12) {
            ampm = 'PM';
        } else if (hour > 12) {
            hour -= 12;
            ampm = 'PM';
        }
        
        if (min.length == 1) {
            min = '0' + min;
        }
        
        return hour + ':' + min + ' ' + ampm;
    }
    
    function formatDate(date) {
        var ds = date.toDateString().split(/ /),
            mon = monthDict[date.getMonth()],
            day = date.getDate()+'',
            dayi = parseInt(day),
            year = date.getFullYear(),
            thisyear = (new Date()).getFullYear(),
            th = 'th';
        
        // anti-'th' - but don't do the 11th, 12th or 13th
        if ((dayi % 10) == 1 && day.substr(0, 1) != '1') {
            th = 'st';
        } else if ((dayi % 10) == 2 && day.substr(0, 1) != '1') {
            th = 'nd';
        } else if ((dayi % 10) == 3 && day.substr(0, 1) != '1') {
            th = 'rd';
        }
        
        if (day.substr(0, 1) == '0') {
            day = day.substr(1);
        }
        
        return mon + ' ' + day + th + (thisyear != year ? ', ' + year : '');
    }
    
    delta = delta + (relative_to.getTimezoneOffset() * 60);

    if (delta < 5) {
        r = 'less than 5 seconds ago';
    } else if (delta < 30) {
        r = 'half a minute ago';
    } else if (delta < 60) {
        r = 'less than a minute ago';
    } else if (delta < 120) {
        r = '1 minute ago';
    } else if (delta < (45*60)) {
        r = (parseInt(delta / 60)).toString() + ' minutes ago';
    } else if (delta < (2*90*60)) { // 2* because sometimes read 1 hours ago
        r = 'about 1 hour ago';
    } else if (delta < (24*60*60)) {
        r = 'about ' + (parseInt(delta / 3600)).toString() + ' hours ago';
    } else {
        if (delta < (48*60*60)) {
            r = formatTime(date) + ' yesterday';
        } else {
            r = formatTime(date) + ' ' + formatDate(date);
        }
    }

    return r;
}


function ltrim(text) {
    return text.replace(/^\s+/g, "");
}
function rtrim(text) {
    return text.replace(/\s+$/g, "");
}

jQuery.unescapeHTML = function(html){
	return $("<div>"+html+"</div>").text();
}