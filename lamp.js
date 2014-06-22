var five = require('johnny-five')
var status = require('./status')
var duration = 2500
var states = {

	good : { red : 0, green : 255, blue : 255 }
	, bad : { red : 255, green : 0, blue : 0 }
}

module.exports = lamp
function lamp(cb) {

	var board

	console.log("* Initializing arduino...")
	board = new five.Board({ port : '/dev/tty.usbmodem1421' })
	// board = new five.Board()

	var leds = lamp
	board.on('ready', function() {

		console.log("* Initialization of arduino complete.")

		leds.interval
		leds.delta = true
		leds.currentState = leds.previousState = undefined
		leds.currentMode = leds.previousMode = undefined
		leds.red = new five.Led(11)
		leds.blue = new five.Led(09)
		leds.green = new five.Led(10)
		leds.red.color = 'red'
		leds.blue.color = 'blue'
		leds.green.color = 'green'
		leds.all = [ leds.red, leds.green, leds.blue ]

		leds.all.map(function(led) {

			led.fadeIn(duration)
		})
		setTimeout(cb, duration)
		board.repl.inject({
			red : leds.red
			, blue : leds.blue
			, green : leds.green
			, all : leds.all
		})
	})

}

lamp.state = function state(st) {

	var leds = this
	var state = ( st > 1 ? 'bad' : 'good' )
	var mode = ( st % 2 == 0 ? 'solid' : 'pulse' )

	if(state != leds.currentState || mode != leds.currentMode) {

		leds.previousState = leds.currentState
		leds.previousMode = leds.currentMode
		leds.currentState = state
		leds.currentMode = mode
		
		allOut()
		clearInterval(leds.interval)
		setTimeout(fadeState, duration)
		if(mode == 'pulse') {

			setTimeout(function() {

				leds.interval = setInterval(beat, 100)

			}, duration)
		}
	}

	function beat() {

		if(!leds.delta) {

			var up
			leds.all.map(function(led) {

				if(led.value > 0) { up = led.value }
			})
			if(up > 0) { return }
			fadeState()
		}
		else {

			var low = 0
			leds.all.map(function(led) {

				if(led.value != states[state][led.color]) { ++low }

			})
			if(low != 0) { return }
			allOut()
		}
		leds.delta = !leds.delta
	}

	function allOut() { 

		leds.all.map(function (led) { 

			if(led.value > 0) {

				led.fade(0, duration)
			}
		}) 
	}

	function fadeState() {

		leds.all.map(function(led) {

			if(!states[state][led.color]) { return }
			led.fade(states[state][led.color], duration)

		})
	}
}
