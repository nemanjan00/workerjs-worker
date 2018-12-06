# workerjs-worker

[![npm](https://img.shields.io/npm/dw/workerjs-worker.svg)](https://www.npmjs.com/package/workerjs-worker)
[![npm](https://img.shields.io/npm/dt/workerjs-worker.svg)](https://www.npmjs.com/package/workerjs-worker)
[![npm](https://img.shields.io/npm/v/workerjs-worker.svg)](https://www.npmjs.com/package/workerjs-worker)
[![Dependency Status](https://www.versioneye.com/user/projects/591edf7ddb8883004c604b15/badge.svg?style=flat-square)](https://www.versioneye.com/user/projects/591edf7ddb8883004c604b15)

[![GitHub issues](https://img.shields.io/github/issues/workerJS/workerjs-worker.svg)](https://github.com/workerJS/workerjs-worker/issues)
[![GitHub closed issues](https://img.shields.io/github/issues-closed/workerJS/workerjs-worker.svg)](https://github.com/workerJS/workerjs-worker/issues?q=is%3Aissue+is%3Aclosed)
[![GitHub pull requests](https://img.shields.io/github/workerJS/workerjs-worker.svg)](https://github.com/workerJS/workerjs-worker/pulls)
[![GitHub closed pull requests](https://img.shields.io/github/issues-pr-closed/workerJS/workerjs-worker.svg)](https://github.com/workerJS/workerjs-worker/pulls?q=is%3Apr+is%3Aclosed)
[![GitHub contributors](https://img.shields.io/github/contributors/workerJS/workerjs-worker.svg)](https://github.com/workerJS/workerjs-worker/graphs/contributors)

CLI Interface and library for starting and managing workers and forwarding commands and results.

## Instalation

```bash
# You need project.json in same directory
npm install workerjs-worker --save
```

## Usage

### Step 1:  Starting

```bash
# This starts worker on channel example and spawns ./examples/workerExample.js
WORKER=./examples/workerExample.js WORKERNAME=example ./node_modules/.bin/workerjs-worker
```

### Step 2: Usage inside process

```nodejs
const worker = require("workerjs-worker");

// Initialize communication to worker
worker.init();

// Subscribe on new tasks from worker
worker.on("task", function(task){
	// You just got new task

	setTimeout(function(){
		// Tell something to client
		task.publish(123);

		// Say to worker that you are finished. 
		task.finish();
	}, Math.random() * 3000);

});

// Tell worker that you are ready to recieve tasks
worker.ready();

```

## TODO

 * Define more clear names for parts of worker [worker, process, etc.]

 * Implement logging and add client to worker

