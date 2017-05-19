var child_process = require('child_process');
var path = require("path");

var task = require("./src/taskServer");
var events = require("./src/events")();

var config = {
	workerName: process.env.WORKERNAME || "tasks",
	workerCount: process.env.WORKERCOUNT || 10,
	worker: process.env.WORKER || "./workerExample",
	tasksLimit: process.env.TASKSLIMIT || 1, // -1 for unlimited
	restartLimit: process.env.restartLimit || 100
}

var w = {
	_task: task,
	_restartCount: 0,
	_limitReached: false,
	_workers: [],
	_readyWorkers: [],
	_taskCount: 0,
	_config: undefined,
	_stop: false,

	start: function(config){
		w._config = config;

		for(i = 0; i < config.workerCount; i++){
			w.fork();
		}

		w.listen();
	},

	listen: function(){
		events.on(w._config.workerName, function(data){
			var data = JSON.parse(data);
			var task = w._task(data, w._config.workerName);

			if((!w._stop) && (worker = w.getNextWorker())){
				task.send(worker);
				w._taskCount++;
				
				if(w._taskCount >= w._config.workerCount * w._config.tasksLimit && w._config.tasksLimit > -1){
					events.stop();
				}
				
				task.on("finished", function(data){
					if(!w._stop){
						w._taskCount--;
						events.start();
					}

					if(w._taskCount == 0 && w._stop){
						process.exit();
					}

					delete task;
				});
			} else {
				console.error("All workers busy... ");
				task.failed();
			}
		});
	},

	getNextWorker: function(){
		var worker = false;

		if(w._config.tasksLimit == -1){
			worker = w.findWorker();
		} else {
			var tempWorker = w.findWorker();
		
			if(tempWorker.tasks.length <= w._config.tasksLimit){
				worker = tempWorker;
			}
		}

		return worker;
	},

	findWorker: function(){
		var worker = w._workers[0];

		w._workers.forEach(function(currentWorker){
			if(currentWorker.tasks.length < worker.tasks.length){
				worker = currentWorker;
			}
		});

		return worker;
	},

	fork: function(number){
		var worker = child_process.fork(path.join(process.cwd(), w._config.worker));

		if(number == undefined){
			number = w._workers.length + 1;
		}

		worker.tasks = [];
		worker.name = "Worker " + number;
		worker.number = number;

		w._workers.push(worker);

		worker.on("message", function(message){
			if(message.type == "ready"){
				w._readyWorkers.push(worker);
			}
		});

		worker.on('exit', (code, signal) => {
			w.exited(worker);
		});

		console.log(worker.name + " started... ");

		return worker;
	},

	exited: function(worker){
		worker.tasks.forEach(function(task){
			task.failed("error");

			w._taskCount--;
		});

		w._restartCount++;

		var name = "";
		var number = 0;

		w._workers = w._workers.filter(function(currentWorker, key){
			if(currentWorker == worker){
				name = worker.name;
				number = worker.number;
			}

			return currentWorker != worker;
		});

		w._readyWorker = w._readyWorkers.filter(function(currentWorker){
			return currentWorker != worker;
		});

		console.log(name + " exited... ");

		if(w._workers.length == 0){
			process.exit(0);
		}

		if(w._stop){
			return;
		}


		if(w._config.restartLimit != -1 && w._config.restartLimit <= w._restartCount){
			// TODO: Notify user

			if(!w._limitReached){
				console.log("Restart limit reached... ");
			}

			w._limitReached = true;

			if(w._workers.length == 0){
				process.exit(1);
			}

			return;
		}

		w.fork(number);
	}
}

w.start(config);

process.stdin.resume();//so the program will not close instantly

function exitHandler(options, err) {
	if (options.cleanup) {};

	w._stop = true;

	if (err) console.log(err.stack);
	if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:false}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:false}));

