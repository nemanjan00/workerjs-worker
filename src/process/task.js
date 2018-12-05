var redis = require("workerjs-redis")({url: process.env.REDIS_URL || undefined});
var messaging = redis.messaging;

module.exports = function(task){
	var t = {
		_task: undefined,

		finish: function(){
			process.send({type: "finished", _uid: t._task._uid});
		},
		failed: function(){
			process.send({type: "failed", _uid: t._task._uid});
		},
		publish: function(data){
			// Todo: make this work
			process.send({type: "message", _uid: t._task._uid, message: JSON.stringify(data)});
			messaging.emit(t._task._uid, JSON.stringify(data));
		}
	};

	t._task = task;

	return t;
};
