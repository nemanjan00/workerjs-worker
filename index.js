var util = require('util');
var EventEmitter = require('events');

var task = require("./src/taskClient");

var worker = {
	init: function(){
		EventEmitter.call(worker);

		worker.prototype = {};
		util.inherits(worker, EventEmitter);

		worker.on = worker.prototype.on;
		worker.emit = worker.prototype.emit;

		// Make sure process stays alive

		process.on("message", function(){});
	},

	on: undefined,
	emit: undefined,

	ready: function(){
		process.send({type: "ready"});	

		process.on("message", function(message){
			if(message.type == "task"){
				console.log(message.task);
				worker.emit("task", task(message.task));
			}
		});
	}
}

module.exports = worker;

