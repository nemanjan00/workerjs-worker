var child_process = require('child_process');
var path = require("path");

var events = require("./src/events")();

var config = {
	workerName: "tasks",
	workerCount: 10,
	worker: "./worker",
	tasksLimit: -1 // -1 for unlimited, 0 for one per worker and >0 for exact number
}

var w = {
	_workers: [],
	_config: undefined,

	start: function(config){
		w._config = config;

		for(i = 0; i < config.workerCount; i++){
			w.fork();
		}
	},

	fork: function(){
		var worker = child_process.fork(path.join(process.cwd(), w._config.worker));
		w._workers.push(worker);

		worker.send("123");

		worker.on('exit', (code, signal) => {
			w.exited(worker);
		});

		return worker;
	},

	exited: function(worker){
		w._workers = w._workers.filter(function(currentWorker){
			return currentWorker != worker;
		});

		w.fork();
	}
}

w.start(config);

events.on(config.workerName, function(data){
	console.log(data);
});

