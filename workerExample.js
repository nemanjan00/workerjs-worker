var worker = require("./");

worker.init();

worker.on("task", function(task){
	task.finish();
});

worker.ready();

