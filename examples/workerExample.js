var worker = require("../src/process/worker.js");

worker.init();

worker.on("task", function(task){
	setTimeout(function(){
		if(Math.random() * 100 > 10){
			task.publish(123);
			task.finish();
		} else {
			task.failed();
		}
	}, 500 + Math.random() * 200);
});

worker.ready();

