var events = require("./src/events")();

var crypto = require('crypto');

var i = 0;

function send(){
	var task = {
		task: {},
		time: Math.floor(new Date().getTime()/1000),
		persistant: true,
		ttl: 5,
		i: i++
	}

	task.uid = crypto.createHash('md5').update(JSON.stringify(task)).digest("hex");

	events.emit("tasks", JSON.stringify(task)).then(function(){send()});
}

send();

