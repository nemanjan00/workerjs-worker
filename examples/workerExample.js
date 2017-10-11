var worker = require("../");

worker.init();

worker.on("task", function(task){
	setTimeout(function(){
		if(Math.random() * 1000 > 10){
			task.publish(123);
			task.finish();
		} else {
			task.failed();
		}
	}, Math.random() * 2000);
});

worker.ready();

