var redis = require("workerjs-redis")({url: process.env.REDIS_URL || undefined});

var queue = redis.queue;

var EventEmitter = require('events').EventEmitter;

module.exports = function(task, name){
	var t = {
		_task: undefined,
		_worker: undefined,
		_name: undefined,
		_queue: queue,
		_eventEmitter: new EventEmitter(),
	
		send: function(worker){
			t._worker = worker;
			t._worker.send({type: "task", task: t._task});

			t._worker.tasks.push(t);

			console.log(t._worker.name+" was assigned task "+t._task._uid+"... ");

			var eventReciever = function(message){
				if(message.type == "finished" && message._uid == t._task._uid){
					t.cleanup();
					t._worker.removeListener("message", eventReciever, true);

					console.log(t._worker.name+" finished task "+t._task._uid+"... ");

					t.emit("finished", t._task.i);
				}
				
				if(message.type == "failed" && message._uid == t._task._uid){
					t.cleanup();
					t._worker.removeListener("message", eventReciever, true);

					console.log(t._worker.name+" failed task "+t._task._uid+"... ");

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
				t._queue.emit(t._name, JSON.stringify(task));
				console.log("Task "+t._task._uid+" readded to queue... ");
			} else {
				console.log("Task "+t._task._uid+" reached TTL and will not be added again... ");
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
