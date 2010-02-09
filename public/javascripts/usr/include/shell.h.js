/*
 *  shell.h.js
 *  Contains all the common vars/defintion requried across the shell app.
 *	
 */
var shell = new Object();

/* Define a new module/namespace for each object to avoid conflicts **/
shell.module = function (ns){
  var parts = ns.split(".");
  var root = window;

  for(var i=0; i<parts.length; i++){
    if(typeof root[parts[i]] == "undefined")
      root[parts[i]] = new Object();

	root = root[parts[i]];
  }
}


