var events = require("workerjs-redis")();
var EventEmitter = require('events').EventEmitter;

module.exports = function(task, name){
	var t = {
		_task: undefined,
		_worker: undefined,
		_name: undefined,
		_events: events,
		_eventEmitter: new EventEmitter(),
	
		send: function(worker){
			t._worker = worker;
			t._worker.send({type: "task", task: t._task});

			t._worker.tasks.push(t);

			console.log(t._worker.name+" was assigned task "+t._task.uid+"... ");

			var eventReciever = function(message){
				if(message.type == "finished" && message.uid == t._task.uid){
					t.cleanup();
					t._worker.removeListener("message", eventReciever, true);

					console.log(t._worker.name+" finished task "+t._task.uid+"... ");

					t.emit("finished", t._task.i);
				}
				
				if(message.type == "failed" && message.uid == t._task.uid){
					t.cleanup();
					t._worker.removeListener("message", eventReciever, true);

					console.log(t._worker.name+" failed task "+t._task.uid+"... ");

					t.failed("error");

					t.emit("failed", t._task.i);
				}
			}

			t._worker.on("message", eventReciever);
		},
		cleanup: function(){
			t._worker.tasks = t._worker.tasks.filter(function(task){
				return task != t;
			});
		},
		failed: function(type){
			if(!t._task.persistant || type == "error"){
				t._task.ttl--;
			}

			if(t._task.ttl > 0){
				t._events.emit(t._name, JSON.stringify(task));
				console.log("Task "+t._task.uid+" readded to queue... ");
			} else {
				console.log("Task "+t._task.uid+" reached TTL and will not be added again... ");
			}
		}
	}

	t.on = function(name, callback){
		t._eventEmitter.on(name, callback);
	};

	t.emit = function(name, data){
		t._eventEmitter.emit(name, data);
	}

	t._task = task;
	t._name = name;

	return t;
}
