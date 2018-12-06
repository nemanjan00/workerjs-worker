// Singelton for config

// Apply .env vars
require("dotenv").config();

// Define config getter/setter
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

// Apply defaults
const defaultSettings = require("../../config.json");
config.setDefaults(defaultSettings);

module.exports = config; 

