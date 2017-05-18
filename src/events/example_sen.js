var queue = require("./index")();

setInterval(function(){
	queue.emit("tasks", "123");
}, 1000)

