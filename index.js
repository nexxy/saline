var lamp = require('./lamp')
var domain = require('domain')
var jenkins = require('jenkins')
var statuses = require('./status')
var config = require('./config.json')
var query = require('querystring')
var util = require('util')
var d = domain.create()

console.log("* Initializing Jenkins client...")
var agent = jenkins(connString(config))
d.on('error', function(err) {

	console.log(err.stack)
	process.exit(1)
})
// ready()
lamp(ready)
function ready() { setTimeout(list, 2000) }
function list() { agent.job.list(d.intercept(results)) }
function results(list) {

	/**
	 * Get all job status colors
	 * and return the 'highest'
	 */

	var current = list
		.map(color)
		.reduce(max, 0)
	;

	lamp.state(current)
	ready()
}


function connString(conf) {

	return util.format(

		'%s://%s:%s@%s:%s/'
		, conf.proto
		, query.escape(conf.username)
		, query.escape(conf.password)
		, conf.host
		, conf.port
	)
}

function color(el) { return el.color || 99 }
function max(prev, cur) {

	var val = statuses.indexOf(cur)
	if(val > prev) { return val }
	return prev
}
