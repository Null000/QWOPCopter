var gravity = [0, 10]; //m/s^2
var scale = 1; // pixels/m


var renderer = PIXI.autoDetectRenderer(800, 600, {backgroundColor: 0x1099bb});
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

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

stage.addChild(player);


function keyboard(keyCode) {
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

function div2D(v, s) {
    return [v[0] / s, v[1] / s];
}

function doPhysics(object, time) {
    var acceleration = div2D(object.physics.appliedForce, object.physics.mass);

    if (object.physics.gravity) {
        acceleration = add2D(acceleration, gravity);
    }
    object.physics.speed = add2D(object.physics.speed, mul2D(acceleration, time));


    object.physics.appliedForce = [0, 0];
    //F = m a
    //a = F/m
    //v = t a

    object.x += object.physics.speed[0] * scale;
    object.y += object.physics.speed[1] * scale;
}

var keyObject = keyboard(65); //a

keyObject.press = function () {
    //key object pressed
    player.physics.appliedForce = add2D(player.physics.appliedForce, [0, -150]);
};
keyObject.release = function () {
    //key object released
};


var fps = 60;
var frameTime = 1000/fps;
var physicsTime = 1 / fps;

// start animating
animate();
function animate() {
    setTimeout(function () {
        requestAnimationFrame(animate);
        leftRotor.rotation += 0.3;
        rightRotor.rotation -= 0.3;

        doPhysics(player, physicsTime);

        if (player.y > 600) {
            player.y = 600;
            player.physics.speed = mul2D(player.physics.speed, -0.3);
        }
        renderer.render(player);

        // render the container
        renderer.render(stage);
    }, frameTime);
}
