var child_process = require('child_process');
var path = require("path");

var events = require("./src/events")();

var config = {
	workerName: "tasks",
	workerCount: 10,
	worker: "./workerExample",
	tasksLimit: -1 // -1 for unlimited, 0 for one per worker and >0 for exact number
}

var w = {
	_workers: [],
	_readyWorkers: [],
	_config: undefined,

	start: function(config){
		w._config = config;

		for(i = 0; i < config.workerCount; i++){
			w.fork();
		}

		w.listen();
	},

	listen: function(){
		events.on(w._config.workerName, function(data){
			console.log(JSON.parse(data));
		});
	},

	fork: function(){
		var worker = child_process.fork(path.join(process.cwd(), w._config.worker));
		w._workers.push(worker);

		worker.on("message", function(message){
			if(message.type == "ready"){
				w._readyWorkers.push(worker);

				worker.send({type: "task"});
			}
		});

		worker.on('exit', (code, signal) => {
			w.exited(worker);
		});

		return worker;
	},

	exited: function(worker){
		w._workers = w._workers.filter(function(currentWorker){
			return currentWorker != worker;
		});

		w._readyWorker = w._readyWorkers.filter(function(currentWorker){
			return currentWorker != worker;
		});

		w.fork();
	}
}

w.start(config);

