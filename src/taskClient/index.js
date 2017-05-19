var events = require("workerjs-redis")();

module.exports = function(task){
	var t = {
		_task: undefined,

		finish: function(){
			process.send({type: "finished", uid: t._task.uid})
		},
		failed: function(){
			process.send({type: "failed", uid: t._task.uid})
		},
		publish: function(data){
			events.publish(t._task.uid, JSON.stringify(data));
		}
	}

	t._task = task;

	return t;
}
