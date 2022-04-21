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
        "ba                      ",
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
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "bbbbbbbbbbbbbbbbbbbbbbbb",
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
        "a                       ",
        "a                       ",
        "a                       ",
        "a                       ",
        "a                      a",
        "a                      a",
        "a                      a",
        "a                      a",
        "a                      a",
        "bbbbbbbbbbbbbbbbbbbbbbbb",
    ],
]



const LEVELOPT = {
    width: 32,
    height: 16,
    "a": () => [ //block
        sprite("blocka"),
        area(),
        solid(),
        "block",
        "blocka",
        "bouncy",
        {
            points: 1
        }
    ],
    "b": () => [
        sprite("blockb"),
        area(),
        solid(),
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
    ".": () => [
        sprite("ball"),
        area(),
        origin("center"),
        "ball",
        {
            hspeed: 100,
            vspeed: 50
        }
    ],

}

scene("game", ({ levelIndex, score, lives}) => {
    addLevel(LEVELS[levelIndex], LEVELOPT);

    const player = add([
        sprite("paddle"),
        pos(200, 200),
        body(),
        area(),
        scale(1),
        origin("center"),
        "player",
        {
            score: 0,
            shield: 100,
            laser_cooldown: 0.5,
            laser_speed: -300,
            can_shoot: true,
            move_speed: 200,
        }
    ]);


    onKeyDown("left", () => {
        if (toScreen(player.pos).x > 35) {
            player.move(-player.move_speed, 0);
        }
    });

    onKeyDown("right", () => {
        if (toScreen(player.pos).x < 735) {
            player.move(player.move_speed, 0);
        }
    });


    onKeyDown("space", () => {
        if (player.can_shoot) { // new if statement
            add([
                sprite("ball"),
                pos(player.pos),
                origin("center"),
                area(),
                "bullet",
                "mobile",
                "destructs",
                {
                    speed: 100
                }
            ]);
            player.can_shoot = false; //
            wait(player.laser_cooldown, () => {
                player.can_shoot = true;
            });
        }
    });

    onUpdate("bullet", (b) => {
        b.move(0, player.laser_speed);
        if (b.pos.y < 5) {
            destroy(b);
        }
    });
    let dir = 100;
    onUpdate("blocka", (b) => {
       if (b.pos.x < 50) {
           dir = 100;
        }
       else if (b.pos.x > 753) {
           dir = -100;
       }
        b.move(dir, 0);
    });



    //collisions
    onCollide("bullet", "block", (bullet, block) => {
        block.destroy();
        bullet.destroy();
        score += block.points
    });

    // ui
    onDraw(() => {
        drawText({
            text: `SCORE: ${score}`,
            size: 16,
            pos: vec2(8,8),
            font: "breakout",

        });
        drawText({
            text: `LIVES: ${lives}`,
            size: 16,
            pos: vec2(width()*13/16, 8),
            font: "breakout",

        });
    });
});


// start game on first level
function start() {
    go("game", {
        levelIndex: 0,
        score: 0,
        lives: 3,
    });
}

start();
