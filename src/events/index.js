var redis = require("redis");

var util = require('util');
var EventEmitter = require('events');

module.exports = function(){
	var queue = {
		_listening: {},
		_client: undefined,

		_handler: function(channel){
			queue._client.blpop("tasks", 5, function(err, data){
				if(data != null){
					queue.prototype.emit(channel, data[1]);
				}

				queue._handler(channel);
			});
		},
		on: function(eventName, listener){
			if(queue._listening[eventName] == undefined){
				queue._handler(eventName);
				queue._listening[eventName] = true;
			}

			return queue.prototype.on(eventName, listener);
		},
		emit: function(eventName, data){
			return new Promise(function(resolve, reject){
				queue._client.rpush(eventName, data, function(err, data){
					if(err !== null){
						reject(err);
					} else {
						resolve(data);
					}
				});
			});
		}
	}

	EventEmitter.call(queue);

	queue.prototype = {};
	util.inherits(queue, EventEmitter);

	queue._client = redis.createClient.apply(this, arguments);

	return queue;
}

