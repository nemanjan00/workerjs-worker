// This is the module process imports
// It is there to recieve task instantiate task

var EventEmitter = require('events').EventEmitter;

var task = require("./task");

var worker = {
	_eventEmitter: new EventEmitter(),

	init: function(){
		worker.on = function(name, callback){
			worker._eventEmitter.on(name, callback);
		};

		worker.emit = function(name, data){
			worker._eventEmitter.emit(name, data);
		}

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

