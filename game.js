// Initialize kaboom
kaboom({
    width: 768,
    height: 360,
    background: [0,0,0]
});

// Load assets
loadSpriteAtlas("https://raw.githubusercontent.com/vBentzen/super-invaderKaboomJS/main/sprites/ship.png", {
    "ship": {
        x: 10,
        y: 7,
        width: 32,
        height: 24,
    }
} )

loadSpriteAtlas("https://raw.githubusercontent.com/vBentzen/super-invaderKaboomJS/main/sprites/beams.png", {
    "bulleta": {
        x: 6,
        y: 155,
        width: 13,
        height: 17,
    },
    "bulletb": {
        x: 7,
        y:39,
        width: 13,
        height:17,
    },
})
//load monsters
loadSpriteAtlas("https://raw.githubusercontent.com/vBentzen/super-invaderKaboomJS/main/sprites/enemies3-sheet-alpha.png", {
    "monstera": {
        x: 73,
        y: 474,
        width: 15,
        height: 15,
    },
    "monsterb": {
        x: 73,
        y: 490,
        width: 15,
        height: 15,
    },
    "monsterc": {
        x: 60,
        y: 392,
        width: 20,
        height: 19,
    },
})

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
        "     cccccccccccc       ",
        "     bbbbbbbbbbbbbbbbbb ",
        "  aaaaaaaaaaaaaaaaaaaaa ",
        "  aaaaaaaaaaaaaaaaaaaaa ",
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
    ],
    [
        "                        ",
        "          a a           ",
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
    ],

]

const LEVELOPT = {
    width: 35,
    height: 30,
    shot_speed: 200,
    "a": () => [
        sprite("monstera"),
        area(),
        "monster",
        "bouncy",
        patrol(50),
        {
            points: 1,
            hp: 1,
            monster_damage: 10,
            laser_cooldown: 1.5,
            laser_speed: -300,
            can_shoot: true,
        }
    ],
    "b": () => [
        sprite("monsterb"),
        area(),
        "monster",
        "bouncy",
        patrol(50),
        {
            points: 2,
            hp: 2,
            monster_damage: 18,
            laser_cooldown: 2.5,
            laser_speed: -300,
            can_shoot: true,
        }
    ],
    "c": () => [
        sprite("monsterc"),
        area(),
        "monster",
        "bouncy",
        patrol(50),
        {
            points: 4,
            hp: 5,
            monster_damage: 20,
            laser_cooldown: 3.5,
            laser_speed: -300,
            can_shoot: true,
        }
    ],
}

scene("start", () => {
    add([
        text("Press space to start", { size: 24 }),
        pos(vec2(width()/2, height()/3)),
        origin("center"),
    ]);

    onKeyRelease("space", () => {
        go("game", {
            levelIndex: 0,
        });
    })
});

scene("game", ({ levelIndex}) => {
    addLevel(LEVELS[levelIndex], LEVELOPT);
    let score = 0;
    let lives = 3;

    const player = add([
        sprite("ship"),
        pos(width()/2, height()-20),
        area(),
        scale(1.3),
        origin("center"),
        "player",
        {
            hp: 100,
            player_damage: 1,
            laser_cooldown: 0.5,
            laser_speed: -300,
            can_shoot: true,
            move_speed: 200,
        }
    ]);


    onKeyDown("left", () => {
        if (toScreen(player.pos).x > 20) {
            player.move(-player.move_speed, 0);
        }
    });

    onKeyDown("right", () => {
        if (toScreen(player.pos).x < width()-20) {
            player.move(player.move_speed, 0);
        }
    });


    onKeyDown("space", () => {
        if (player.can_shoot) {
            player.can_shoot = false; //
            add([
                sprite("bulletb"),
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

    onUpdate("monster", (m) => {
        if (m.can_shoot) {
            m.can_shoot = false;
            wait(rand(5,30), () => {
                add([
                    sprite("bulleta"),
                    pos(m.pos),
                    origin("center"),
                    area(),
                    "monster_bullet",
                    {
                        damage: m.monster_damage
                    }
                ]);
                m.can_shoot = true;
            })
        }
    });

    onUpdate("monster_bullet", (b) => {
        b.move(0, LEVELOPT.shot_speed);
        if (b.pos.y > height() - 10) {
            destroy(b);
        }
    });

    //collisions
    onCollide("bullet", "monster", (bullet, monster) => {
        monster.hp -= player.player_damage
        if (monster.hp <=0) {
            monster.destroy();
            score += monster.points
        }
        bullet.destroy();
        // level end -- NEW CODE BELOW
        if (get("monster").length === 0 && levelIndex < LEVELS.length) { // next level
            go("game", {
                levelIndex: levelIndex+1,
                score: score,
                lives: lives
            });
        }
    });

    onCollide("monster_bullet", "player", (b, p) => {
        p.hp -= b.damage;
        shake(4);
        if (lives <= 0 ) {
            go("gameover", score);
        }
        else if (p.hp <= 0) {
            lives--;
            p.hp = 100;
            shake(30);
        }
    })

    // ui
    onDraw(() => {
        drawText({
            text: `SCORE: ${levelIndex}`,
            size: 16,
            pos: vec2(8,8),
            font: "breakout",
        });

        drawText({
            text: `HEALTH:${player.hp}`,
            size: 12,
            pos: vec2(width()*14/16, 4),
            font: "breakout",
        });

        drawText({
            text: `LIVES:${lives}`,
            size: 12,
            pos: vec2(width()*14/16, 18),
            font: "breakout",
        });

        drawText({
            text: `DMG:${player.player_damage}`,
            size: 10,
            pos: vec2(width()*9/16, 4),
            font: "breakout",
        });
        drawText({
            text: `ATTACK SPEED:${player.laser_cooldown}`,
            size: 10,
            pos: vec2(width()*9/16, 16),
            font: "breakout",
        });


    });
});

function patrol(distance = 100, speed = 50, dir = 1) {
    return {
        id: "patrol",
        require: ["pos", "area",],
        startingPos: vec2(0, 0),
        add() {
            this.startingPos = this.pos;
            this.on("collide", (obj, side) => {
                if (side === "left" || side === "right") {
                    dir = -dir;
                }
            });
        },
        update() {
            if (Math.abs(this.pos.x - this.startingPos.x) >= distance || this.pos.x > width()-20 || this.pos.x < 0) {
                dir = -dir;
            }
            this.move(speed * dir, 0);
        },
    };
}

scene("win", () => {


    add([
        text(
            `GAME OVER\n\nFINAL SCORE: ${score} \n current highscore: \n\nPress space to start new game`,
            { size: 24 }),
        pos(vec2(width()/2, height()/2)),
        origin("center"),
    ]);

    onKeyRelease("space", () => {
        go("game", {
            levelIndex: 0,
        });
    })

});


scene("gameover", (score) => {

    if (score > highscore) {
        highscore = score;
    }
    add([
        text(
            `GAME OVER\n\nFINAL SCORE: ${score} \n current highscore: ${highscore}\n\nPress space to start new game`,
            { size: 24 }),
        pos(vec2(width()/2, height()/2)),
        origin("center"),
    ]);

    onKeyRelease("space", () => {
        go("game", {
            levelIndex: 0,
        });
    })
});

go("start");