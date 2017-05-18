var worker = require("./");

worker.init();

worker.on("task", function(task){
	setTimeout(function(){
		task.finish();
	}, Math.random() * 3000);

});

worker.ready();

