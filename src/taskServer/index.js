var events = require("../events")();
var nodeEvents = require('events');

module.exports = function(task, name){
	var t = {
		_task: undefined,
		_worker: undefined,
		_name: undefined,
		_events: events,
		_eventEmitter: new nodeEvents.EventEmitter(),
	
		send: function(worker){
			t._worker = worker;
			t._worker.send({type: "task", task: t._task});

			t._worker.tasks.push(t);

			console.log(t._worker.name+" was assigned task "+t._task.uid+"... ");

			t._worker.on("message", function(message){
				if(message.type = "finished" && message.uid == t._task.uid){
					console.log(t._worker.name+" finished task "+t._task.uid+"... ");

					t.emit("finished", t._task.i);

					t._worker.tasks = t._worker.tasks.filter(function(task){
						return task != t;
					});
				}
			});
		},
		failed: function(type){
			if(!t._task.persistant || type == "error"){
				t._task.ttl--;
			}

			if(t._task.ttl > 0){
				t._events.emit(t._name, JSON.stringify(task));
			}
		}
	}

	t = new t;

	t.on = t._eventEmitter.on;
	t.emit = t._eventEmitter.emit;

	t._task = task;
	t._name = name;

	return Object.create(t);
}
