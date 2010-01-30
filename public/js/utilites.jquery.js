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
