/*
 *  pipe.js
 *  Contains the main stuff required for piping.
 *  Copyright 2010 Monther. All rights reserved.
 *	 
 *   require 'shell.h.js'
 *   	
 */

/* Define the namespace for the pipe related stuff **/
shell.module("shell.pipe");


/* callQueue is an array to hold all the commands we need 
   to exectued one after the other.
*/
shell.pipe.callQueue = new Array();

/*  The output of each pipe is saved in the dataOnPipe var */
shell.pipe.dataOnPipe = null;

/*  Check if the Call queue is empty or not */
shell.pipe.callQueueEmpty = function(){
	return shell.pipe.callQueue.length == 0;
}

/*  Reset the  callQueueEmpty */
shell.pipe.resetCallQueueEmpty = function(){
	shell.pipe.callQueue.length = 0 // clear out the array
	shell.pipe.dataOnPipe = null;
}

/*  Get the next command to parse 
	NOTE: This function modifies the CalQueue by poping the next element in the queue
*/
shell.pipe.callQueueNext = function(){
	return shell.pipe.callQueue.shift();
}