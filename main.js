var GRAVITY = [0, 10]; //m/s^2
var SCALE = 1; // pixels/m
var PI = 3.14159265359;
var SCREEN_WIDTH = 1024;
var SCREEN_HEIGHT = 760;

function makePlayer() {
// create a texture from an image path
    var texture = PIXI.Texture.fromImage('qwop.png');

// create a new Sprite using the texture
    var player = new PIXI.Container();
    var body = new PIXI.Sprite(texture);
    var leftRotor = new PIXI.Sprite(texture);
    var rightRotor = new PIXI.Sprite(texture);
    body.anchor.x = 0.5;
    body.anchor.y = 1;
    leftRotor.anchor.x = 0.5;
    leftRotor.anchor.y = 0.5;
    rightRotor.anchor.x = 0.5;
    rightRotor.anchor.y = 0.5;
    body.x = 0;
    body.y = 0;
    leftRotor.x = -25;
    leftRotor.y = -20;
    rightRotor.x = 25;
    rightRotor.y = -20;


    player.addChild(body);
    player.addChild(leftRotor);

    player.addChild(rightRotor);

// move the sprite to the center of the screen
    player.x = 200;
    player.y = 150;

    player.physics = {
        mass: 1,
        appliedForce: [0, 0],
        gravity: true,
        speed: [0, 0]
    };

    player.animate = function (frameTime) {
        //animate
        leftRotor.rotation += 0.3;
        rightRotor.rotation -= 0.3;
    };

    return player;
}

function makeKeyboardTrigger(keyCode) {
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = function (event) {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };

    //The `upHandler`
    key.upHandler = function (event) {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };

    //Attach event listeners
    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );
    return key;
}


function add2D(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
}

function mul2D(v, s) {
    return [v[0] * s, v[1] * s];
}

function size2D(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

function div2D(v, s) {
    return [v[0] / s, v[1] / s];
}

function init2D(rotation, size) {
    return [Math.sin(rotation) * size, Math.cos(rotation) * size];
}

function mirrorHorizontal2D(v) {
    return [v[0], v[1] * -1];
}

function mirrorVertical2D(v) {
    return [v[0] * -1, v[1]];
}

function doPhysics(object, time) {
    var acceleration = div2D(object.physics.appliedForce, object.physics.mass);

    if (object.physics.gravity) {
        acceleration = add2D(acceleration, GRAVITY);
    }
    object.physics.speed = add2D(object.physics.speed, mul2D(acceleration, time));


    object.physics.appliedForce = [0, 0];
    //F = m a
    //a = F/m
    //v = t a

    object.x += object.physics.speed[0] * SCALE;
    object.y += object.physics.speed[1] * SCALE;
}

var ACTION_UP_FORCE = -100;
var ACTION_UP_ROTATION = 0.1;
var ACTION_SIDE_ROTATION = 0.3;

var leftUpAction = function () {
    player.rotation += ACTION_UP_ROTATION;
    player.physics.appliedForce = add2D(player.physics.appliedForce, init2D(-player.rotation, ACTION_UP_FORCE));
};
var rightUpAction = function () {
    player.rotation -= ACTION_UP_ROTATION;
    player.physics.appliedForce = add2D(player.physics.appliedForce, init2D(-player.rotation, ACTION_UP_FORCE));
};
var leftAction = function () {
    player.rotation += ACTION_SIDE_ROTATION;
};
var rightAction = function () {
    player.rotation -= ACTION_SIDE_ROTATION;
};

function addActions() {
//key codes http://help.adobe.com/en_US/AS2LCR/Flash_10.0/help.html?content=00000520.html
    var leftKey = makeKeyboardTrigger(81); //q
    var leftUpKey = makeKeyboardTrigger(87); //w
    var rightUpKey = makeKeyboardTrigger(79); //o
    var rightKey = makeKeyboardTrigger(80); //p
    var altLeftKey = makeKeyboardTrigger(222); //'
    var altLeftUpKey = makeKeyboardTrigger(188); //,
    var altRightUpKey = makeKeyboardTrigger(82); //r
    var altRightKey = makeKeyboardTrigger(76); //l

    leftKey.press = leftAction;
    altLeftKey.press = leftAction;
    leftUpKey.press = leftUpAction;
    altLeftUpKey.press = leftUpAction;
    rightUpKey.press = rightUpAction;
    altRightUpKey.press = rightUpAction;
    rightKey.press = rightAction;
    altRightKey.press = rightAction;
}


var renderer = PIXI.autoDetectRenderer(SCREEN_WIDTH, SCREEN_HEIGHT, {backgroundColor: 0x1099bb});
document.body.appendChild(renderer.view);

var stage = new PIXI.Container();
var player = makePlayer();
stage.addChild(player);

addActions();

var fps = 60;
var frameTime = 1000 / fps;
var physicsTime = 1 / fps;
gameLoop();
function gameLoop() {
    setTimeout(function () {
        requestAnimationFrame(gameLoop);
        //move
        doPhysics(player, physicsTime);

        //fix collisions
        if (player.y > SCREEN_HEIGHT) {
            player.y = SCREEN_HEIGHT;
            player.physics.speed = mirrorHorizontal2D(mul2D(player.physics.speed, 0.7));
        }
        if (player.x > SCREEN_WIDTH) {
            player.x = SCREEN_WIDTH;
            player.physics.speed = mirrorVertical2D(mul2D(player.physics.speed, 0.7));
        }
        if (player.x < 0) {
            player.x = 0;
            player.physics.speed = mirrorVertical2D(mul2D(player.physics.speed, 0.7));
        }

        //animate
        player.animate(frameTime);

        //render
        renderer.render(player);
        renderer.render(stage);
    }, frameTime);
}
