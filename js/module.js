"use strict";

var Module = {
    preRun : [],
    postRun : [],
	onRuntimeInitialized: function(){
		var app = new Module.App();
	}
};