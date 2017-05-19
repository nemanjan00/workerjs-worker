var events = require("workerjs-redis")();

var crypto = require('crypto');

var i = 0;

function send(){
	var task = {
		task: {
			path: "./img/10456002_775035765948022_2962199842657345901_n.jpg"
		},
		time: Math.floor(new Date().getTime()/1000),
		persistant: true,
		ttl: 5,
		i: i++
	}

	task.uid = crypto.createHash('md5').update(JSON.stringify(task)).digest("hex");

	events.emit("tasks", JSON.stringify(task)).then(function(){});
}

send();

