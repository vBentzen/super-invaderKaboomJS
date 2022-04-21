// Initialize kaboom
kaboom({
    width: 768,
    height: 360,
    background: [0,0,0]
});

// Load assets
loadSpriteAtlas("https://raw.githubusercontent.com/vBentzen/fluffy-breakerGameKaboom/main/sprites/breakout_pieces.png", {
    "blocka": {
        x: 8,
        y: 8,
        width: 32,
        height: 16,
    },
    "blockb": {
        x: 8,
        y: 28,
        width: 32,
        height: 16,
    },
    "blockc": {
        x: 8,
        y: 48,
        width: 32,
        height: 16,
    },
    "blockd": {
        x: 8,
        y: 68,
        width: 32,
        height: 16,
    },
    "paddle": {
        x: 76,
        y: 152,
        width: 64,
        height: 16,
    },
    "ball": {
        x: 66,
        y: 136,
        width: 8,
        height: 8,
    },
    "heart": {
        x: 120,
        y: 136,
        width: 10,
        height: 9,
    }
});

// Load pwerup assets
loadSpriteAtlas("https://raw.githubusercontent.com/vBentzen/fluffy-breakerGameKaboom/main/sprites/breakout_custom.png", {
    "extraball": {
        x: 64,
        y: 0,
        width: 16,
        height: 16,
    },
});
loadFont("breakout", "https://raw.githubusercontent.com/vBentzen/fluffy-breakerGameKaboom/main/sprites/breakout_font.png", 6, 8, { chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ  0123456789:!'" });


// Levels
const LEVELS = [
    [
        "                        ",
        "                        ",
        "dddddddddddddddddddddddd",
        "cccccccccccccccccccccccc",
        "bbbbbbbbbbbbbbbbbbbbbbbb",
        "aaaaaaaaaaaaaaaaaaaaaaaa",
        "                        ",
        "                        ",
        "                        ",
        "           .            ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "          @             ",
    ],
    [
        "aaaaaaaaaaaaaaaaaaaaaaa ",
        " a                    a ",
        " a  bbbbbbbbbbbbbbbbb a ",
        " a  b              b  a ",
        " a  b     cccccc   b  a ",
        " a  b  ccddddddcc  b  a ",
        " a  b     cccccc   b  a ",
        " a  b              b  a ",
        " a  bbbbbbbbbbbbbbbbb a ",
        " a                    a ",
        "aaaaaaaaaaaaaaaaaaaaaaa ",
        "                        ",
        "           .            ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "          @             ",
    ],
]

const LEVELOPT = {
    width: 32,
    height: 16,
    "a": () => [ //block
        sprite("blocka"),
        area(),
        "block",
        "bouncy",
        {
            points: 1
        }
    ],
    "b": () => [
        sprite("blockb"),
        area(),
        "block",
        "bouncy",
        {
            points: 2
        }
    ],
    "c": () => [
        sprite("blockc"),
        area(),
        "block",
        "bouncy",
        {
            points: 4
        }
    ],
    "d": () => [
        sprite("blockd"),
        area(),
        "block",
        "bouncy",
        {
            points: 8
        }
    ],
    "@": () => [
        sprite("paddle"),
        area(),
        origin("center"),
        "paddle",
        "bouncy",
        {
            speed: 400
        }
    ],
    ".": () => [
        sprite("ball"),
        color(WHITE),
        area(),
        origin("center"),
        "ball",
        {
            hspeed: 100,
            vspeed: 50
        }
    ],

}

let ballnumber = 1;

scene("game", ({ levelIndex, score, lives}) => {
    addLevel(LEVELS[levelIndex], LEVELOPT);

    // player's paddle
    const paddle = get("paddle")[0];

    // mouse controls
    onUpdate(() => {
        if (mousePos().x > 0 && mousePos().x < width() && mousePos().y > 0 && mousePos().y < height()) {
            if (mousePos().x < paddle.worldArea().p1.x) { //left
                paddle.move( -paddle.speed, 0);
            }
            else if (mousePos().x > paddle.worldArea().p2.x) { //right
                paddle.move(paddle.speed, 0);
            }
        }
    });

    //ball movement
    onUpdate("ball", (ball) => {

        // bounce ball off screen edges
        if (ball.worldArea().p1.x < 0 || ball.worldArea().p2.x > width()) {
            ball.hspeed = -ball.hspeed;
        }

        if (ball.worldArea().p1.y < 0) {
            ball.vspeed= -ball.vspeed;
        }

        // fall off screen
        if (ball.pos.y > height() && ballnumber === 1) {
            lives -= 1;
            if (lives <= 0) {
                go("lose", { score: score});
            }
            else {
                ball.pos.x = width()/2;
                ball.pos.y = height()/2;
            }
        }
        else if (ball.pos.y > height() && ballnumber >= 2) {
            ball.destroy();
            ballnumber --;
        }


        // move ball
        ball.move(ball.hspeed, ball.vspeed);
    });



    function spawnball() {

        add([
            sprite("ball"),
            pos(100,200),
            "ball",
            area(),
            {
                hspeed: 100,
                vspeed: 50
            }
        ]);

        ballnumber++;
    }



    //collisions
    onCollide("ball", "bouncy", (ball, bouncy) => {
        ball.vspeed = -ball.vspeed;

        // if (bouncy.is("paddle")) { //play sound
        //     play("paddlehit");
        // }
    });

    onCollide("ball", "block", (ball, block) => {
        block.destroy();
        score += block.points;
        // play("blockbreak"); //play sound

        // end level if all blocks are destroyed
        if (get("block").length === 0) { // go next level
            if (levelIndex < LEVELS.length) {
                go("game", {
                    levelIndex: levelIndex+1,
                    score: score,
                    lives: lives,
                });
            }
            else { // win game if no more levels
                go("win", { score: score});
            }
        }

        // powerups
        if (chance(0.005)) {// extra life
            add([
                sprite("heart"),
                pos(block.pos),
                area(),
                origin("center"),
                scale(2),
                cleanup(),
                "powerup",
                {
                    speed: 80,
                    effect() { lives++; }
                }
            ]);
        }



        if (chance(0.95)) {// extra ball
            add([
                sprite("extraball"),
                pos(block.pos),
                area(),
                origin("center"),
                scale(2),
                cleanup(),
                "powerup",
                {
                    speed: 80,
                    effect() { spawnball() },
                }
            ]);
        }
    });



    // powerups
    onUpdate("powerup", (powerup) => {
        powerup.move(0, powerup.speed);
    });

    paddle.onCollide("powerup", (powerup) => {
        powerup.effect();
        powerup.destroy();
    })

    // ui
    onDraw(() => {
        drawText({
            text: `SCORE: ${score}`,
            size: 16,
            pos: vec2(8,8),
            font: "breakout",
            color: WHITE
        });
        drawText({
            text: `LIVES: ${lives}`,
            size: 16,
            pos: vec2(width()*13/16, 8),
            font: "breakout",
            color: WHITE
        });
    });
});


// gameover screens
scene("lose", ({ score }) => {

    add([
        text(`GAME OVER\n\nYOUR FINAL SCORE WAS ${score}`, {
            size: 32,
            width: width(),
            font: "breakout"
        }),
        pos(12),
    ]);

    add([
        text(`PRESS ANY KEY TO RESTART`, {
            size: 16,
            width: width(),
            font: "breakout"
        }),
        pos(width() / 2, height() * (3 / 4)),
    ]);

    onKeyPress(start);
    onMousePress(start);
});

scene("win", ({ score }) => {
    add([
        text(`CONGRATULATIONS, YOU WIN!\n\nYOUR FINAL SCORE WAS ${score}`, {
            size: 32,
            width: width(),
            font: "breakout"
        }),
        pos(width()/2, height()/2),
    ]);

    add([
        text(`PRESS ANY KEY TO RESTART`, {
            size: 16,
            width: width(),
            font: "breakout"
        }),
        pos(width()/2, height()*(3/4)),
    ]);

    onkeydown(start);
    onmousedown(start);
})

// start game on first level
function start() {
    go("game", {
        levelIndex: 0,
        score: 0,
        lives: 3,
    });
}

start();
