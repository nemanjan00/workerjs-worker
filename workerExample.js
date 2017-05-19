var worker = require("./");

worker.init();

worker.on("task", function(task){
	console.log(task);
	setTimeout(function(){
		task.finish();
	}, Math.random() * 3000);

});

worker.ready();

