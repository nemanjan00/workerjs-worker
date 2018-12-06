// This is the module process imports
// It is there to recieve task instantiate task

const EventEmitter = require("events").EventEmitter;
const task = require("./task");

const worker = {
	_eventEmitter: new EventEmitter(),

	//init: function(){
		//// Make sure process stays alive

		//process.on("message", function(){});
	//},

	on: function(name, callback){
		worker._eventEmitter.on(name, callback);
	},

	emit: (name, data) => {
		worker._eventEmitter.emit(name, data);
	},

	ready: function(){
		process.send({type: "ready"});	

		process.on("message", function(message){
			if(message.type == "task"){
				worker.emit("task", task(message.task));
			}
		});
	}
};

module.exports = worker;

