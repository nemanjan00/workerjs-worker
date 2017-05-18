var events = require("./src/events")();

var crypto = require('crypto');

function send(){
	var task = {
		task: {},
		time: Math.floor(new Date().getTime()/1000),
		persistant: true,
		ttl: 5
	}

	task.uid = crypto.createHash('md5').update(JSON.stringify(task)).digest("hex");

	events.emit("tasks", JSON.stringify(task)).then(function(){send()});
}

send();

