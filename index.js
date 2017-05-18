var util = require('util');
var nodeEvents = require('events');

var task = require("./src/taskClient");

var worker = {
	_eventEmitter: new nodeEvents.EventEmitter(),

	init: function(){
		worker.on = worker._eventEmitter.on;
		worker.emit = worker._eventEmitter.emit;

		// Make sure process stays alive

		process.on("message", function(){});
	},

	on: undefined,
	emit: undefined,

	ready: function(){
		process.send({type: "ready"});	

		process.on("message", function(message){
			if(message.type == "task"){
				worker.emit("task", task(message.task));
			}
		});
	}
}

module.exports = worker;

