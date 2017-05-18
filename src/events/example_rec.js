var queue = require("./index")();

queue.on("tasks", function(data){
	console.log(data);
});

