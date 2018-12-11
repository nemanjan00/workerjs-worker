const worker = require("../src/process/worker.js");

worker.on("task", function(task){
	setTimeout(function(){
		if(Math.random() * 100 > 10){
			task.publish(123);
			task.finish();
		} else {
			task.failed();
		}
	}, 0 + Math.random() * 0);
});

worker.ready();

