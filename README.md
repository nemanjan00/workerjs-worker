# workerjs-mux

[![npm](https://img.shields.io/npm/dw/workerjs-mux.svg.svg)](https://www.npmjs.com/package/workerjs-mux)
[![npm](https://img.shields.io/npm/dt/workerjs-mux.svg)](https://www.npmjs.com/package/workerjs-mux)
[![npm](https://img.shields.io/npm/v/workerjs-mux.svg)](https://www.npmjs.com/package/workerjs-mux)

[![GitHub issues](https://img.shields.io/github/issues/workerJS/workerjs-mux.svg)](https://github.com/workerJS/workerjs-mux/issues)
[![GitHub closed issues](https://img.shields.io/github/issues-closed/workerJS/workerjs-mux.svg)](https://github.com/workerJS/workerjs-mux/issues?q=is%3Aissue+is%3Aclosed)
[![GitHub pull requests](https://img.shields.io/github/workerJS/workerjs-mux.svg)](https://github.com/workerJS/workerjs-mux/pulls)
[![GitHub closed pull requests](https://img.shields.io/github/issues-pr-closed/workerJS/workerjs-mux.svg)](https://github.com/workerJS/workerjs-mux/pulls?q=is%3Apr+is%3Aclosed)
[![GitHub contributors](https://img.shields.io/github/contributors/workerJS/workerjs-mux.svg)](https://github.com/workerJS/workerjs-mux/graphs/contributors)

CLI Interface and library for starting and managing
workers and forwarding commands and results.

## Instalation

```bash
# You need project.json in same directory
npm install workerjs-mux --save
```

## Usage

### Step 1:  Starting

```bash
# This starts worker on channel example and spawns ./examples/workerExample.js
WORKER=./examples/workerExample.js WORKERNAME=example ./node_modules/.bin/workerjs-mux
```

### Step 2: Usage inside process

```nodejs
const worker = require("workerjs-mux");

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

* Implement logging and add client to worker

* Implement `node-ipc`

