// Singelton for config

const config = {
	_data: {
	},
	setDefaults: (defaults) => {
		Object.keys(defaults).forEach((key) => {
			if(config.get(key) === undefined){
				config.set(key, defaults[key]);
			}
		});
	},
	set: (name, value) => {
		config._data[name] = value;
	},
	get: (name) => {
		if(config._data[name] === undefined){
			if(process.env[name] !== undefined){
				config.set(name, process.env[name]);
			}
		}

		return config._data[name];
	},
	getAll: () => {
		return config._data;
	}
};

module.exports = config; 

