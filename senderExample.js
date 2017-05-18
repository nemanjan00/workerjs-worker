var events = require("./src/events")();

var crypto = require('crypto');

var task = {
	something: "something",
	time: Math.floor(new Date().getTime()/1000)
}

task.uid = crypto.createHash('md5').update(JSON.stringify(task)).digest("hex");

events.emit("tasks", JSON.stringify(task));

