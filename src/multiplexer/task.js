const redis = require("workerjs-rabbitmq")({url: process.env.REDIS_URL || undefined});

const queue = redis.queue;
const messaging = redis.messaging;

const EventEmitter = require("events").EventEmitter;

const config = {
	debug: process.env.DEBUG || false
};

module.exports = function(task, name){
	const t = {
		_task: undefined,
		_worker: undefined,
		_name: undefined,
		_queue: queue,
		_eventEmitter: new EventEmitter(),
	
		send: function(worker){
			t._worker = worker;
			t._worker.send({type: "task", task: t._task});

			t._worker.tasks.push(t);

			if(config.debug){
				console.log(t._worker.name+" was assigned task "+t._task._uid+"... ");
			}

			const eventReciever = function(message){
				console.log(message);

				if(message.type == "finished" && message._uid == t._task._uid){
					t.cleanup();
					t._worker.removeListener("message", eventReciever, true);

					if(config.debug){
						console.log(t._worker.name+" finished task "+t._task._uid+"... ");
					}

					t.emit("finished", t._task.i);
				}
				
				if(message.type == "failed" && message._uid == t._task._uid){
					t.cleanup();
					t._worker.removeListener("message", eventReciever, true);

					if(config.debug){
						console.log(t._worker.name+" failed task "+t._task._uid+"... ");
					}

					t.failed("error");

					t.emit("failed", t._task.i);
				}

				if(message.type == "message"  && message._uid == t._task._uid){
					t._messaging.emit(t._task._uid, JSON.stringify(message.message));
				}
			};

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
				if(config.debug){
					console.log("Task "+t._task._uid+" readded to queue... ");
				}
			} else {
				if(config.debug){
					console.log("Task "+t._task._uid+" reached TTL and will not be added again... ");
				}
			}
		}
	};

	t.on = function(name, callback){
		t._eventEmitter.on(name, callback);
	};

	t.emit = function(name, data){
		t._eventEmitter.emit(name, data);
	};

	t._task = task;
	t._name = name;

	return new Promise((resolve) => {
		Promise.all([
			queue,
			messaging
		]).then((resolvedDeps) => {
			t._queue = resolvedDeps[0];
			t._messaging = resolvedDeps[1];

			resolve(t);
		})
	});
};
