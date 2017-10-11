var worker = require("../");

worker.init();

worker.on("task", function(task){
	setTimeout(function(){
		if(Math.random() * 1000 > 500){
			task.publish(123);
			task.finish();
		} else {
			task.failed();
		}
	}, Math.random() * 3000);
});

worker.ready();

