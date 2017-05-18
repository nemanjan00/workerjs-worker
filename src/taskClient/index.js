module.exports = function(task){
	var t = {
		_task: undefined,

		finish: function(){
			process.send({type: "finished", uid: t._task.uid})
		}
	}

	t._task = task;

	return t;
}
