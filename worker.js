var child_process = require('child_process');
var path = require("path");

var events = require("./src/events")();

var config = {
	workerName: "tasks",
	workerCount: 10,
	worker: "./workerExample",
	tasksLimit: -1, // -1 for unlimited, 0 for one per worker and >0 for exact number
	restartLimit: 10
}

var w = {
	_restartCount: 0,
	_limitReached: false,
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
			var task = JSON.parse(data);
			if(worker = w.getNextWorker()){
				worker.send({type: "task", task: data});
			} else {
				if(!task.persistant){
					task.ttl--;
				}

				events.emit(w._config.workerName, JSON.stringify(task));
			}
		});
	},

	getNextWorker: function(){
		return w._readyWorkers[0];
	},

	fork: function(number){
		var worker = child_process.fork(path.join(process.cwd(), w._config.worker));

		if(number == undefined){
			number = w._workers.length + 1;
		}

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

