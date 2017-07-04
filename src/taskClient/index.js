var events = require("workerjs-redis")({url: process.env.REDIS_URL || undefined});

module.exports = function(task){
	var t = {
		_task: undefined,

		finish: function(){
			process.send({type: "finished", _uid: t._task._uid})
		},
		failed: function(){
			process.send({type: "failed", _uid: t._task._uid})
		},
		publish: function(data){
			events.publish(t._task._uid, JSON.stringify(data));
		}
	}

	t._task = task;

	return t;
}
