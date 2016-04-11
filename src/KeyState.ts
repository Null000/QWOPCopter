
function KeyState() {
	var me = this;

	me.keysDown = {};

	window.addEventListener("keydown", function(event) {
		me.keysDown[event.keyCode] = true;
	}, false);
	window.addEventListener("keyup", function(event) {
		delete me.keysDown[event.keyCode];
	}, false);
}

KeyState.prototype.isDown = function(keycode) {
	var me = this;
	if (_.isString(keycode)) {
		var keycodes = this.keyMap[keycode];
		return _.some(keycodes, function(kc) { return me.keysDown[kc]; })
	} else {
		return this.keysDown[keycode] === true;
	}
};

KeyState.prototype.keyMap = {
	'L2': [ 81, 222 ], //Q or '
	'L1': [ 87, 188 ], //W or ,
	'R1': [ 79, 82 ], //O or R
	'R2': [ 80, 76 ]  //P or L
};
