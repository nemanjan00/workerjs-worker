var redis = require("redis");

var EventEmitter = require('events');

var queue = {
	_listening: {},
	_client: undefined,
	_disabled: false,
	_eventEmitter: new EventEmitter(),

	_handler: function(channel){
		setTimeout(function(){
			if(!queue._disabled){
				queue._client.blpop("tasks", 5, function(err, data){
					if(data != null){
						queue._eventEmitter.emit(channel, data[1]);
					}

					queue._handler(channel);
				});
			} else {
				queue._handler(channel);
			}
		}, 0);
	},
	on: function(eventName, listener){
		if(queue._listening[eventName] == undefined){
			queue._handler(eventName);
			queue._listening[eventName] = true;
		}

		return queue._eventEmitter.on(eventName, listener);
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
	},

	stop: function(){
		queue._disabled = true;
	},
	start: function(){
		queue._disabled = false;
	}
}

module.exports = function(){
	if(queue._client == undefined){
		queue._client = redis.createClient.apply(this, arguments);
	}

	return queue;
}

