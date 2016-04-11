/// <reference path="../typings/browser.d.ts" />
/// <reference path="./KeyState.ts" />
var _:any;

var GRAVITY:number = 30; //m/s^2
var SCALE:number = 1; // pixels/m
var PI:number = 3.14159265359;
var SCREEN_WIDTH:number = 1024;
var SCREEN_HEIGHT:number = 760;
var COLLISION_TYPES = {
    CIRCLE: 'circle' //has radius
};

interface QwopObject extends PIXI.DisplayObject {
    physics?:{
        mass:number,
        appliedForce:number[],
        gravity:boolean,
        speed:number[]
    },
    collision?:any,
    animate?:(timeframe:number) => void
}

interface QwopHudObject extends PIXI.DisplayObject {
    updateHud?:()=> void
}

//google fonts
var WebFontConfig:any = {
    google: {
        families: ['Source Code Pro', 'Podkova:700']
    },

    active: function () {
        // do something
        //init();
    }

};
(function () {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = true;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();

//game engine stuff

function makePlayer(x:number, y:number):QwopObject {
    // create a new Sprite using the texture
    var player = new PIXI.Container();
    var qPlayer:QwopObject = player;

    var body = new PIXI.Text("COPTER", {
        font: "bold 20px Podkova",
        fill: "#cc00ff",
        align: "center",
        stroke: "#FFFFFF",
        strokeThickness: 6
    });

    var leftRotor = new PIXI.Text("QWOP", {
        font: "bold 20px Podkova",
        fill: "#000000",
        align: "center",
        stroke: "#FFFFFF",
        strokeThickness: 1
    });
    var rightRotor = new PIXI.Text("QWOP", {
        font: "bold 20px Podkova",
        fill: "#000000",
        align: "center",
        stroke: "#FFFFFF",
        strokeThickness: 1
    });

    body.anchor.x = 0.5;
    body.anchor.y = 1;
    leftRotor.anchor.x = 0.5;
    leftRotor.anchor.y = 0.5;
    rightRotor.anchor.x = 0.5;
    rightRotor.anchor.y = 0.5;
    body.x = 0;
    body.y = 0;
    leftRotor.x = -35;
    leftRotor.y = -25;
    rightRotor.x = 35;
    rightRotor.y = -25;

    player.addChild(body);
    player.addChild(leftRotor);
    player.addChild(rightRotor);

    // set position
    player.x = x;
    player.y = y;

    //makes the object be effected by physics
    qPlayer.physics = {
        mass: 1,
        appliedForce: [0, 0],
        gravity: true,
        speed: [0, 0]
    };

    //gives custom animation/render
    qPlayer.animate = function (timeDelta) {
        //animate
        var speed:number = timeDelta * 15;
        leftRotor.rotation += speed;
        rightRotor.rotation -= speed;
    };

    //collision attributes
    qPlayer.collision = {
        type: COLLISION_TYPES.CIRCLE,
        radius: body.width / 2
    };

    return player;
}

function makePoint(x, y):QwopObject {
    var point = new PIXI.Text("POI\nNT", {
        font: "bold 20px Podkova",
        fill: "#ff0000",
        align: "center",
        stroke: "#FFFFFF",
        strokeThickness: 6
    });
    var qPoint:QwopObject = point;

    point.anchor.x = point.anchor.y = 0.5;
    point.x = x;
    point.y = y;

    qPoint.collision = {
        type: COLLISION_TYPES.CIRCLE,
        radius: point.width / 2,
        onCollision: function (other) {
            if (other == player) {
                score++;
                removeFromStage.push(point);
                _.pull(pointList, point); //remove from array
                previousPointList.push(point);

                if (previousPointList.length > 2) {
                    var newPoint = previousPointList.shift();
                    pointList.push(newPoint);
                    addToStage.push(newPoint);
                }
            }
        }
    };

    return point;
}

function makeTree(x:number, y:number) {
    var tree = new PIXI.Container();
    var trunk = new PIXI.Text("TREETREE", {
        font: "bold 100px Podkova",
        fill: "#994f00",
        align: "center",
        stroke: "#000000",
        strokeThickness: 6
    });
    trunk.anchor.x = 0;
    trunk.anchor.y = 0.5;
    trunk.rotation = -PI/2;

    tree.addChild(trunk);

    tree.x = x;
    tree.y = y;

    return tree;
}

function makeOverlayText(text:string) {
    var overlayText = new PIXI.Text(text, {
        font: "35px Source Code Pro",
        fill: "white",
        align: "center",
        stroke: "black",
        strokeThickness: 6
    });

    overlayText.x = (SCREEN_WIDTH - overlayText.width) / 2;
    overlayText.y = (SCREEN_HEIGHT - overlayText.height) / 2;

    return overlayText;
}

function add2D(a:number[], b:number[]) {
    return [a[0] + b[0], a[1] + b[1]];
}

function mul2D(v:number[], s:number) {
    return [v[0] * s, v[1] * s];
}

function size2D(v:number[]) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

function div2D(v:number[], s:number) {
    return [v[0] / s, v[1] / s];
}

function init2D(rotation:number, size:number) {
    return [Math.sin(rotation) * size, Math.cos(rotation) * size];
}

function mirrorHorizontal2D(v:number[]) {
    return [v[0], v[1] * -1];
}

function mirrorVertical2D(v:number[]) {
    return [v[0] * -1, v[1]];
}

function doPhysics(object:QwopObject, time:number) {
    var acceleration = div2D(object.physics.appliedForce, object.physics.mass);

    if (object.physics.gravity) {
        acceleration = add2D(acceleration, [0, GRAVITY]);
    }
    object.physics.speed = add2D(object.physics.speed, mul2D(acceleration, time));


    object.physics.appliedForce = [0, 0];
    //F = m a
    //a = F/m
    //v = t a

    object.x += object.physics.speed[0] * SCALE;
    object.y += object.physics.speed[1] * SCALE;

    object.physics.speed = mul2D(object.physics.speed, 0.97);
}

function doCollision(first, second) {
    var didCollide = false;

    //currently we only have circular bounding boxes
    var xDiff = first.x - second.x;
    var yDiff = first.y - second.y;
    var squareDistance = xDiff * xDiff + yDiff * yDiff;
    var radiusSum = first.collision.radius + second.collision.radius;
    if (squareDistance <= radiusSum * radiusSum) {
        didCollide = true;
    }

    if (didCollide) {
        if (first.collision.onCollision) {
            first.collision.onCollision(second);
        }
        if (second.collision.onCollision) {
            second.collision.onCollision(first);
        }
    }
}


var MAX_ANGLE = PI / 2; //90 degrees
var ROTATION_DECAY_FACTOR = 0.95;

var ACTION_ROTATION = MAX_ANGLE / ROTATION_DECAY_FACTOR - MAX_ANGLE;

function handleInput() {
    var throttle = 0.7;

    //TODO define proper states. Don't rely on startTimestamp to know if the game started
    if (overlayText) {
        //end game overlay will stay up for at least 3 seconds
        if ((Date.now() > startTimestamp + LEVEL_TIME + 3000) &&
            (keyState.isDown('L1') ||
            keyState.isDown('L2') ||
            keyState.isDown('R1') ||
            keyState.isDown('R2'))) {

            //start level
            metaContainer.removeChild(overlayText);
            overlayText = null;
            score = 0;
            //reset points
            _.forEach(previousPointList, (point)=> {
                pointList.push(point);
                stage.addChild(point);
            });
            previousPointList = [];
            //reset player
            player.x = SCREEN_WIDTH / 2;
            player.y = SCREEN_HEIGHT;
            startTimestamp = Date.now();
        }
        return;
    }

    if (keyState.isDown('R1')) {
        player.rotation -= ACTION_ROTATION;
    }

    if (keyState.isDown('R2')) {
        player.rotation += ACTION_ROTATION;
    }

    if (keyState.isDown('L1')) {
        throttle = 2.4;
    } else if (keyState.isDown('L2')) {
        throttle = 0;
    }


    player.rotation *= ROTATION_DECAY_FACTOR;
    throttle *= GRAVITY;
    player.physics.appliedForce = add2D(player.physics.appliedForce, init2D(-player.rotation, -throttle));
}


//TODO get this executed after the fonts are loaded
//gameplay
var score:number = 0;
var LEVEL_TIME:number = 25000; //ms
var startTimestamp:number = -1;
var keyState = new KeyState();

//create world
var renderer = PIXI.autoDetectRenderer(SCREEN_WIDTH, SCREEN_HEIGHT, {backgroundColor: 0x1099bb});
renderer.view.style.position = 'absolute';
renderer.view.style.left = '50%';
renderer.view.style.top = '50%';

renderer.view.style.transform = 'translate3d( -50%, -50%, 0 )';

document.body.appendChild(renderer.view);
var metaContainer = new PIXI.Container();
var stage = new PIXI.Container();
stage.y = -50;
metaContainer.addChild(stage);

var player:QwopObject = makePlayer(SCREEN_WIDTH / 2, SCREEN_HEIGHT);

stage.addChild(player);

var ground = new PIXI.Text("GROUNDGROUNDGROUND", {
    font: "bold 150px Podkova",
    fill: "#4d2600",
    align: "center",
    stroke: "#000000",
    strokeThickness: 6
});
ground.anchor.x = 0.5;
ground.anchor.y = 0;
ground.x = SCREEN_WIDTH / 2;
ground.y = SCREEN_HEIGHT - 40;
stage.addChild(ground);

var underground = new PIXI.Text("UNDERGROUNDUNDERGROUND", {
    font: "bold 150px Podkova",
    fill: "#331a00",
    align: "center",
    stroke: "#000000",
    strokeThickness: 6
});
underground.anchor.x = 0.5;
underground.anchor.y = 0;
underground.x = SCREEN_WIDTH / 2;
underground.y = ground.y + 90;
stage.addChild(underground);

stage.addChild(makeTree(SCREEN_WIDTH/2,SCREEN_HEIGHT));


var pointList:QwopObject[] = [
    makePoint(100, 100),
    makePoint(100, SCREEN_HEIGHT - 100),
    makePoint(SCREEN_WIDTH - 100, 100),
    makePoint(SCREEN_WIDTH - 100, SCREEN_HEIGHT - 100)];

var previousPointList:QwopHudObject[] = [];

_.forEach(pointList, (point)=> {
    stage.addChild(point);
});


//create HUD
var scoreText = new PIXI.Text('Score: 9001 (just kidding)', {
    font: "35px Source Code Pro",
    fill: "white",
    align: "left",
    stroke: "black",
    strokeThickness: 6
});
var qScoreText:QwopHudObject = scoreText;
qScoreText.updateHud = function () {
    scoreText.text = "Score\n" + score;
};
scoreText.x = 20;
scoreText.y = 20;
var timeText = new PIXI.Text('Time left\n' + LEVEL_TIME, {
    font: "35px Source Code Pro",
    fill: "white",
    align: "right",
    stroke: "black",
    strokeThickness: 6
});
var qTimeText:QwopHudObject = timeText;
qTimeText.updateHud = function () {
    if (startTimestamp > 0) {
        var now:number = Date.now();
        timeText.text = "Time left\n" + Math.max(0, LEVEL_TIME - now + startTimestamp);
    }
};

timeText.x = SCREEN_WIDTH - 20 - timeText.width;
timeText.y = 20;

var hud:QwopHudObject[] = [scoreText, timeText];
_.forEach(hud, (hudElement)=> {
    metaContainer.addChild(hudElement);
});

var overlayText = makeOverlayText("QWOP, QWOP and awaaaaay!");
metaContainer.addChild(overlayText);

var fps:number = 60;
var frameTime:number = 1000 / fps;
var removeFromStage = [];
var addToStage = [];

var lastFrameTime:number = Date.now() - 1;
var now:number;
var timeDelta:number;

var previousScale:number = 1;
var maxScaleChangeSpeed:number = 0.2;

gameLoop();
function gameLoop() {
    setTimeout(function () {
        requestAnimationFrame(gameLoop);
        now = Date.now();
        timeDelta = (now - lastFrameTime) / 1000;
        lastFrameTime = now;
        handleInput();

        //level ends detection
        if (Date.now() > startTimestamp + LEVEL_TIME) {
            if (!overlayText) {
                overlayText = makeOverlayText("You managed to QWOP " + score + " point" + (score == 1 ? "" : "s"));
                metaContainer.addChild(overlayText);
            }
        } else {
            //move
            _.forEach(stage.children, function (child) {
                child = <QwopObject> child;
                if (child.physics) {
                    doPhysics(child, timeDelta);
                }
            });

            //collision resolution
            for (var i = 0; i < stage.children.length; i++) {
                var child = <QwopObject>stage.children[i];
                if (child.collision) {
                    for (var j = i + 1; j < stage.children.length; j++) {
                        var other = <QwopObject>stage.children[j];
                        if (other.collision) {
                            doCollision(child, other);
                        }
                    }
                }

                //stage walls
                if (child == player) {
                    //fix collisions
                    if (child.y > SCREEN_HEIGHT) {
                        child.y = SCREEN_HEIGHT;
                        child.physics.speed = mirrorHorizontal2D(mul2D(player.physics.speed, 0.7));
                    }
                }
            }

            //viewport
            var scale:number = Math.min(1, 15 / size2D(player.physics.speed));
            if (scale > previousScale) {
                scale = Math.min(scale, previousScale + maxScaleChangeSpeed*timeDelta);
            } else {
                scale = Math.max(scale, previousScale - maxScaleChangeSpeed*timeDelta);
            }

            stage.scale.x = scale;
            stage.scale.y = scale;

            stage.x = SCREEN_WIDTH / 2 - player.x * scale;
            stage.y = Math.max(-50, (SCREEN_HEIGHT / 2) / scale - player.y) * scale;

            previousScale = scale;

            //remove things
            _.forEach(removeFromStage, function (childToRemove) {
                stage.removeChild(childToRemove);
            });
            removeFromStage = [];

            //add things
            _.forEach(addToStage, (childToAdd)=> {
                stage.addChild(childToAdd);
            });
            addToStage = [];

            _.forEach(stage.children, function (child) {
                //animate
                if (child.animate) {
                    player.animate(timeDelta);
                }
            });

        }

        //update HUD
        _.forEach(hud, function (hudElement) {
            hudElement.updateHud();
        });

        //render everything
        renderer.render(metaContainer);
    }, frameTime);
}