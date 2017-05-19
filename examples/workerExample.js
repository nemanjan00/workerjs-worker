var worker = require("./");

worker.init();

worker.on("task", function(task){
	console.log(task);
	setTimeout(function(){
		task.publish(123);
		task.finish();
	}, Math.random() * 3000);

});

worker.ready();

