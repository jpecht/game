var definePropertyFunctions = function(game) {

    // ----------------------------- constants -------------------------------
    game.GROUND_Y = 500;
    game.GRAVITY = 2400;
    game.DRAG = 700;
    game.PLAYER_SPEED = 200;
    game.PLAYER_ACCELERATION = 1000;
    game.PLAYER_JUMP_SPEED = -700;
    
    game.TURRET_BUFFER_TIME = 400;
    game.TURRET_MAX_SPEED = 50;
    
    game.money = 0;

    game.turret_attr = {
        'blue_turret': {
            constructTime: 2000,
            fireFreq: 1500,
            health: 3,
            cost: 100
        },
        'green_turret': {
            constructTime: 2000,
            fireFreq: 1000,
            health: 3,
            cost: 150
        }
    };

    // ------------------------- create and update ---------------------------
    game.createWorld = function(level) {
        // start physics engine
        level.physics.startSystem(Phaser.Physics.ARCADE);
        //level.physics.arcade.checkCollision.down = true;
        level.physics.arcade.gravity.y = game.GRAVITY;
        
        // add setting
        level.add.sprite(0, 0, 'sky');
        level.ground = game.add.group();

        var addGroundBlock = function(x, y, img_id) {
            var groundBlock = level.add.sprite(x, y, img_id);
            level.physics.arcade.enable(groundBlock);
            groundBlock.body.immovable = true;
            groundBlock.body.allowGravity = false;
            level.ground.add(groundBlock); 
        }

        for (var i = 0; i < game.width/40; i++) {
            if (i !== 4 && i !== 16) {
                addGroundBlock(40*i, game.GROUND_Y, 'grass');
                addGroundBlock(40*i, game.GROUND_Y + 20, 'ground');
            }
            for (var j = 0; j < 2; j++) {
                if (i < 4 || i > 16) addGroundBlock(40*i, game.GROUND_Y + 40 + 20*j, 'ground');
            }
            addGroundBlock(40*i, game.GROUND_Y + 80, 'ground');
        }

         // add hp display
        game.player_hp_display = this.add.text(5, 5, '', {font: '16px Arial'});  

        // add money display
        game.money += level.start_money;
        game.money_display = this.add.text(5, 30, '$' + game.money, {
            font: '16px Arial',
            fill: 'green'
        });


        // add pause button
        game.pause_button = this.add.text(this.width-100, 10, 'pause (p)', {
            font: '16px Arial',
            cursor: 'pointer'
        });
        game.pause_button.inputEnabled = true;


        // add hotbar
        game.hotbar = level.add.sprite(20, game.height - 60, 'hotbar');
        game.hotbar_select = level.add.sprite(4, 4, 'hotbar_select');
        game.hotbar.addChild(game.hotbar_select);

        // add player
        player = level.add.sprite(level.world.centerX, game.GROUND_Y-50, 'guy');
        level.physics.arcade.enable(player);        
        player.anchor.setTo(0.5, 0.5);
        player.body.collideWorldBounds = true;
        player.body.maxVelocity.setTo(game.PLAYER_SPEED, game.PLAYER_SPEED * 10);
        player.body.drag.setTo(game.DRAG, 0);
        player.maxHealth = 5;
        player.health = 5;
        game.addHealthBar(player, 5);
        game.player_hp_display.setText(player.health);

        player.water_bar_container = game.add.sprite(-16, -19, 'health_bar_container');
        player.water_bar = game.add.sprite(1, 1, 'water_bar');
        player.water_bar_container.addChild(player.water_bar);
        player.addChild(player.water_bar_container);
        player.maxBreath = 1000;
        player.breath = player.maxBreath;


        // add spaceships
        spaceships = game.addSpaceships(level, level.num_spaceships);

        // add turrets
        level.turrets = [];
        var addTurret = function(index, img_id) {
            // create turret group
            var group = level.add.group();
            game.addTurretProperties(group, img_id);

            // add turret to hotbar
            var turret_sprite = level.add.sprite(25*index + 5, 5, img_id);
            turret_sprite.scale = {x: 0.625, y: 0.625};
            game.hotbar.addChild(turret_sprite);
            var num_text = level.add.text(25*index + 15, 33, String(index+1), {
                font: '12px Arial'
            });
            num_text.anchor.setTo(0.5, 0);
            game.hotbar.addChild(num_text);

            return group;
        }

        blue_turrets = addTurret(0, 'blue_turret'); // blue turrets should always be available
        level.turrets[0] = blue_turrets;
        level.hot_turret = blue_turrets;

        if (level.availTurrets.green_turret) {
            green_turrets = addTurret(1, 'green_turret');
            level.turrets[1] = green_turrets;
        }
 

        // add bullets
        red_bullets = level.add.group();
        blue_bullets = level.add.group();
        game.addBulletProperties(red_bullets, 'red_bullet');
        game.addBulletProperties(blue_bullets, 'blue_bullet');
        level.bullets = [red_bullets, blue_bullets];


        // add gems
        gems = level.add.group();
        gems.enableBody = true;
        gems.physicsBodyType = Phaser.Physics.ARCADE;
        gems.createMultiple(30, 'gem');
        gems.setAll('anchor.x', 0.5);
        gems.setAll('anchor.y', 0.5);
        gems.setAll('body.allowGravity', false);

        level.gemTimer = level.time.now;
    };

    game.updateWorld = function(level, next_level_id) {
        var time = level.time.now;

        // check pause button
        if (game.pause_button.input.pointerDown() || level.input.keyboard.isDown(80)) {
            game.paused = !game.paused;
            // unpause isnt implemented yet
            // http://examples.phaser.io/_site/view_full.html?d=misc&f=pause+menu.js&t=pause%20menu
        }

        // check hotbar switch (keycode for 1 is 49)
        var checkHotbarKey = function(keynum) {
            if (level.input.keyboard.isDown(keynum + 49) && level.turrets[keynum]) {
                level.hot_turret = level.turrets[keynum];
                game.hotbar_select.x = 25*keynum + 4;
            }
        };
        for (var i = 0; i < 4; i++) checkHotbarKey(i);


        // update player movement
        cursors = level.input.keyboard.createCursorKeys();   
        if (cursors.left.isDown) {
            player.body.acceleration.x = -game.PLAYER_ACCELERATION;  
        } else if (cursors.right.isDown) {
            player.body.acceleration.x = game.PLAYER_ACCELERATION;
        } else {
            player.body.acceleration.x = 0;
        }

        // check player breath
        if (player.body.y < game.GROUND_Y) {
            player.breath--;
            if (player.breath <= 0) {
                // game over technically
                console.log('out of breath');
                game.state.start('GameOver');
            }
        } else if (player.breath < player.maxBreath) {
            player.breath++;
        }
        player.water_bar.crop({x: 0, y: 0, width: 30 * player.breath / player.maxBreath, height: 4});

        // jumping; double jump and variable jump (variable doesnt seem to work)
        var isGrounded = player.body.onFloor();
        if (isGrounded) level.canDoubleJump = true;
        if (level.input.keyboard.justPressed(Phaser.Keyboard.UP, 5)) {
            if (level.canDoubleJump) level.canVariableJump = true;

            if (level.canDoubleJump || isGrounded) {
                player.body.velocity.y = game.PLAYER_JUMP_SPEED;
                if (!isGrounded) level.canDoubleJump = false;
            } 
        }
        if (level.canVariableJump && level.input.keyboard.justPressed(Phaser.Keyboard.UP, 150)) {
            player.body.velocity.y = game.PLAYER_JUMP_SPEED;
        }
        if (!level.input.keyboard.justPressed(Phaser.Keyboard.UP)) {
            level.canVariableJump = false;
        }


        // spawn gems
        if (time >= level.gemTimer + level.gem_frequency) {
            var gem = gems.getFirstExists(false);
            gem.reset(10+(level.world.width-20)*Math.random(), 330 + 60*Math.random());
            level.gemTimer = time;
        }

        
        // check turret building
        if (!level.inPostConstruct && cursors.down.isDown && !cursors.left.isDown && !cursors.right.isDown) {
            if (!level.constructing) {
                if (!level.inBuffer) {
                    // start buffer stage
                    if (game.money >= level.hot_turret.attr.cost) {
                        level.turretTimer = time;
                        level.inBuffer = true;
                    } else {
                        game.notEnoughMoney();
                    }                    
                } else {
                    if (time >= level.turretTimer + game.TURRET_BUFFER_TIME) {
                        // start building turret
                        level.inBuffer = false;
                        level.constructing = true;
                        game.updateMoney(-level.hot_turret.attr.cost);

                        var turret = level.hot_turret.getFirstExists(false);
                        turret.beingConstructed = true;
                        turret.reset(player.body.x + player.body.width/2, 0, turret.maxHealth);
                        turret.birthTime = null;
                        level.hot_turret.constrTurret = turret;
                    }
                }
            } else {
                if (time >= level.turretTimer + level.hot_turret.attr.constructTime + game.TURRET_BUFFER_TIME) {
                    // done building turret
                    level.constructing = false;
                    level.inPostConstruct = true;
                    level.hot_turret.constrTurret.beingConstructed = false;
                    level.hot_turret.constrTurret.fireTimer = time;
                    level.hot_turret.constrTurret.birthTime = time;

                    level.hot_turret.constrText.destroy();
                } else {
                    // building turret
                    var perc_constr = (time - level.turretTimer - game.TURRET_BUFFER_TIME) / level.hot_turret.attr.constructTime;
                    var constrText = game.add.text(0, 0, perc_constr.toFixed(2), {font: '14px Arial'});
                    level.hot_turret.constrTurret.addChild(constrText);
                    if (level.hot_turret.constrText) level.hot_turret.constrText.destroy();
                    level.hot_turret.constrText = constrText;
                }
            }
        } else {
            level.inBuffer = false;
            if (!cursors.down.isDown) level.inPostConstruct = false;
            if (level.constructing) {
                level.constructing = false;
                level.hot_turret.constrTurret.kill();
            }
        }

        // enemy firing
        spaceships.forEachAlive(function(spaceship) {
            if (time > spaceship.fireTimer + spaceship.fireFreq) {
                spaceship.fireTimer = time;
                spaceship.shoot();
            }
        });
            
        // turrets firing
        for (var i = 0; i < level.turrets.length; i++) {
            level.turrets[i].forEachAlive(function(turret) {
                if (!turret.beingConstructed && time > turret.fireTimer + turret.fireFreq) {
                    turret.fireTimer = time;
                    turret.shoot();
                }
            }, level);
        }
        
        
        // collisions
        level.physics.arcade.collide(player, level.ground);
        level.physics.arcade.overlap(red_bullets, level.ground, function(bullet) {
            bullet.kill();
        });
        /*for (var i = 0; i < level.bullets.length; i++) {
            level.physics.arcade.overlap(level.bullets[i], player, game.bulletHit);
        }*/
        level.physics.arcade.overlap(red_bullets, player, game.bulletHit);
        level.physics.arcade.overlap(spaceships, blue_bullets, game.bulletHit);
        for (var i = 0; i < level.turrets.length; i++) {
            level.physics.arcade.collide(level.turrets[i], player, function(player, turret) {
                if (turret.beingConstructed) {
                    player.kill();
                    setTimeout(function() {
                        game.state.start('GameOver');
                    }, 4000);
                }
            });
            level.physics.arcade.collide(level.turrets[i], level.ground);
            level.physics.arcade.overlap(level.turrets[i], red_bullets, game.bulletHit);
            level.physics.arcade.overlap(level.turrets[i], spaceships, function(turret) {
                turret.kill();
            });
            for (var j = i; j < level.turrets.length; j++) {
                level.physics.arcade.collide(level.turrets[i], level.turrets[j], game.turretCollision);
            }
        }

        level.physics.arcade.overlap(gems, player, game.gotGem);

        // check if game is over OR all enemies are dead
        if (level.nextLevelTimer && time > level.nextLevelTimer + 2000) {
            level.state.start(next_level_id);
        } 
        if (spaceships.countLiving() === 0 && !level.nextLevelTimer) {
            var text = game.add.text(game.world.centerX, game.world.centerY, 'Level Over. Good fucking job.', {
                font: '32px Arial',
                fill: 'rgba(0, 0, 0, 0.8)'
            });
            text.anchor.setTo(0.5, 0.5);

            // add a fade transition of the screen
            game.stage.backgroundColor = 'rgba(38, 139, 56, 0.3)';
            level.nextLevelTimer = time;
        }
    };


    // ----------------------------- enemies ---------------------------------
    game.addSpaceships = function(level, num) {
        // need to prevent spaceships from overlapping with each other
        // also need to make firing bullets more random
        spaceships = level.add.group();
        spaceships.enableBody = true;
        spaceships.physicsBodyType = Phaser.Physics.ARCADE;
        spaceships.createMultiple(30, 'spaceship');
        spaceships.setAll('anchor.x', 0.5);
        spaceships.setAll('anchor.y', 0.5);

        spaceships.forEach(function(spaceship) {
            spaceship.body.collideWorldBounds = true;
            spaceship.body.bounce.set(1);
            spaceship.fireTimer = game.time.now;
            spaceship.fireFreq = 2000;
            spaceship.shoot = function() {
                var bullet = red_bullets.getFirstExists(false);
                bullet.reset(spaceship.body.x + spaceship.body.width/2, bullet.height + spaceship.body.y + spaceship.body.height);
                game.physics.arcade.moveToXY(bullet, spaceship.body.x + spaceship.body.width/2, game.height, 100);
            };
            game.addHealthBar(spaceship, 3);
        });

        for (var i = 0; i < num; i++) {
            var spaceship = spaceships.getFirstExists(false);
            spaceship.reset(level.world.randomX, 150, spaceship.maxHealth);
            spaceship.body.velocity.x = 100;
            spaceship.body.allowGravity = false;
            spaceship.fireTimer = game.time.now;
        }
        return spaceships;
    }


    // ----------------------- group properties ------------------------------
    game.addHealthBar = function(sprite, num) {
        sprite.maxHealth = num;
        sprite.health = num;
        sprite.health_bar_container = game.add.sprite(-16, -25, 'health_bar_container');
        sprite.health_bar = game.add.sprite(1, 1, 'health_bar');
        sprite.health_bar_container.addChild(sprite.health_bar);
        sprite.addChild(sprite.health_bar_container);
    };
    game.addTurretProperties = function(group, img_id) {
        group.attr = game.turret_attr[img_id];

        group.enableBody = true;
        group.physicsBodyType = Phaser.Physics.ARCADE;
        group.createMultiple(30, img_id);
        group.setAll('anchor.x', 0.5);
        group.setAll('anchor.y', 0.5);
        group.forEach(function(turret) {
            turret.body.collideWorldBounds = true;
            turret.body.maxVelocity.setTo(game.TURRET_MAX_SPEED, game.PLAYER_SPEED * 10);
            turret.body.drag.setTo(game.DRAG, 0);
 
            game.addHealthBar(turret, group.attr.health);
            turret.fireFreq = group.attr.fireFreq;
            turret.shoot = function() {
                var bullet = blue_bullets.getFirstExists(false);
                bullet.reset(turret.body.x + turret.body.width/2, turret.body.y);
                game.physics.arcade.moveToXY(bullet, turret.body.x + turret.body.width/2, 0, 100);            
            };
        }, this);               
    };
    game.addBulletProperties = function(group, img_id) {
        group.enableBody = true;
        group.physicsBodyType = Phaser.Physics.ARCADE;
        group.createMultiple(30, img_id);
        group.setAll('anchor.x', 0.5);
        group.setAll('anchor.y', 1);
        group.setAll('outOfBoundsKill', true);
        group.setAll('checkWorldBounds', true);
        group.setAll('body.allowGravity', false);
    };


    // -------------------- group-group interaction --------------------------
    game.bulletHit = function(hitee, bullet) {
        bullet.kill();
        hitee.damage(1);
        if (hitee.health_bar) {         
            hitee.health_bar.crop({
                x: 0,
                y: 0, 
                width: 30 * hitee.health / hitee.maxHealth,
                height: 4
            });
        }
        
        if (hitee == player) {
            game.player_hp_display.setText(player.health);
            if (player.health <= 0) {
                game.state.start('GameOver');
            }
        }
    };
    game.turretCollision = function(turret1, turret2) {
        if (turret1.birthTime === null) turret2.kill();
        else if (turret2.birthTime === null) turret1.kill();
    }

    game.gotGem = function(player, gem) {
        gem.kill();
        game.updateMoney(10);
    }

    // -------------------------- miscellaneous ------------------------------
    game.updateMoney = function(dm) {
        game.money += dm;
        if (game.money_display) game.money_display.setText('$' + game.money);
    }
    game.notEnoughMoney = function() {
        // display on screen "not enough money"
    }
}
