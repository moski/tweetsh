/*
 *  inode.h.js
 *  Define the strcutre for the inode blocks
 *  Copyright 2010 Monther. All rights reserved.
 *	
 */


/*
 *	struct twitter_inode {
 *	  int  i_mode;			
 *	  array  i_block [EXT2_N_BLOCKS];       
 * 	  twitter_inode *parent
 *	};
 *
*/


/* The container for twitter_FS **/  
shell.module("shell.twitter_FS");


shell.twitter_FS.MODE_FILE = 0;
shell.twitter_FS.MODE_DIR = 1;

/* Magic dir is a directory that lives on twitter, just the user home folder /home/moski_doski **/
shell.twitter_FS.MODE_MAGIC_DIR = 2;


shell.twitter_FS.ACL_PUBLIC= 0;	
shell.twitter_FS.ACL_PRIVATE = 1;		



shell.twitter_FS.File_SEPARATOR = "/";

var twitter_inode = jQuery.makeStruct("mode acl children parent name inode_num");