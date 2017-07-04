#!/usr/bin/env node

// For process spawning and configuration

var child_process = require('child_process');
var path = require("path");

// Task server is here for talking to task client inside process and for detecting failure. 

var task = require("./src/taskServer");

// Default settings

var config = {
	workerName: process.env.WORKERNAME || "tasks", // this is unique name for redis queue
	workerCount: process.env.WORKERCOUNT || 10, // number of processes to spawn
	worker: process.env.WORKER || "./examples/workerExample", // process to spawn
	tasksLimit: process.env.TASKSLIMIT || 1, // number of tasks per process.  -1 for unlimited
	restartLimit: process.env.restartLimit || 100 // this worker will shutdown when processes crash this many times
}

// This is for communicating to redis

var redis = require("workerjs-redis")({url: process.env.REDIS_URL || undefined});
var queue = redis.queue;

var w = {
	_task: task, // factory for new task server
	_restartCount: 0, // number of restarts of workers so far, for failure detection
	_limitReached: false, // this becomes true if restart count reached restart limit
	_workers: [], // list of spawned workers
	_readyWorkers: [], // list of workers that reported back as ready TODO: add timeout for worker to get online
	_taskCount: 0, // number of tasks currently running here
	_config: undefined, // Placeholder for config, it is added later in start function
	_stop: false, // This is set to true when worker is shutting down
	_listening: false,

	start: function(config){
		// lets get config and spawn workers and start listening

		w._config = config;

		for(i = 0; i < config.workerCount; i++){
			w.fork();
		}
	},

	listen: function(){
		// wait for task on queue

		queue.on(w._config.workerName, function(data){
			// TODO: move JSON.parse to workerjs-redis

			var data = JSON.parse(data);

			// Create task server for that task

			var task = w._task(data, w._config.workerName);

			// Get worker for it and assign it

			if((!w._stop) && (worker = w.getNextWorker())){
				task.send(worker);
				w._taskCount++;

				if(w._taskCount >= w._readyWorkers.length * w._config.tasksLimit && w._config.tasksLimit > -1){
					queue.stop();
				}

				task.on("failed", function(data){
					w.finished();

					delete task;
				});
				
				task.on("finished", function(data){
					w.finished();

					delete task;
				});
			} else {
				console.error("All workers busy... ");
				task.failed();
			}
		});
	},

	finished: function(){
		if(!w._stop){
			w._taskCount--;
			queue.start();
		}

		if(w._taskCount == 0 && w._stop){
			process.exit();
		}
	},

	getNextWorker: function(){
		// Find best process that fits config. Return false is none available

		var worker = false;

		var tempWorker = w.findWorker();

		if(!tempWorker){
			return false;
		}

		if(w._config.tasksLimit == -1){
			worker = tempWorker;
		} else {
			if(tempWorker.tasks.length <= w._config.tasksLimit){
				worker = tempWorker;
			}
		}

		return worker;
	},

	findWorker: function(){
		// Find process with least tasts

		var worker = w._readyWorkers[0];

		w._readyWorkers.forEach(function(currentWorker){
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

				if(!w._listening){
					w._listening = true;
					w.listen();
				}

				queue.start();
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

// Gracefull shutdown

process.stdin.resume();

function exitHandler(options, err) {
	if (options.cleanup) {};

	w._stop = true;

	if (err) console.log(err.stack);
	if (options.exit) process.exit();
}

process.on('exit', exitHandler.bind(null,{cleanup:true}));
process.on('SIGINT', exitHandler.bind(null, {exit:false}));
process.on('uncaughtException', exitHandler.bind(null, {exit:false}));

