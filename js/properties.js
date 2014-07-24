var definePropertyFunctions = function(game) {

    // ----------------------------- constants -------------------------------
    game.GROUND_Y = 500;
    game.GRAVITY = 2400;
    game.DRAG = 700;
    game.PLAYER_ACCELERATION = 1000;
    game.PLAYER_JUMP_SPEED = -600;
    
    game.TURRET_BUFFER_TIME = 400;
    game.TURRET_MAX_SPEED = 50;
    
    game.is_paused = false;

    game.money = 0;
    game.xp = 0;
    game.player_level = 1;

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
            cost: 200
        }
    };

    // ------------------------- create and update ---------------------------
    game.createWorld = function(level) {
        var time = game.time.now;
        game.money += level.start_money;

        // start physics engine
        level.physics.startSystem(Phaser.Physics.ARCADE);
        //level.physics.arcade.checkCollision.down = true;
        level.physics.arcade.gravity.y = game.GRAVITY;
        
        game.addSetting(level);
        game.addDisplays();
        player = game.addPlayer(level);
        spaceships = game.addSpaceships(level, level.num_spaceships);

        // add turrets
        level.turrets = [];
        blue_turrets = game.addTurret(level, 0, 'blue_turret'); // blue turrets should always be available
        level.turrets[0] = blue_turrets;
        level.hot_turret = blue_turrets;

        if (level.availTurrets.green_turret) {
            green_turrets = game.addTurret(level, 1, 'green_turret');
            level.turrets[1] = green_turrets;
        }

        for (var i = 0; i < level.turrets.length; i++) {
            level.turrets[i].attr.constructTime *= game.stats.build_speed_mod/100;
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

        level.gemTimer = time;


        // Show FPS
        game.time.advancedTiming = true;
        game.fpsText = game.add.text(5, 105, '', {font: '16px Arial'});
    };

    game.updateWorld = function(level, next_level_id) {
        if (game.time.fps !== 0) {
            game.fpsText.setText(game.time.fps + ' FPS');
        }

        var time = level.time.now;

        // check collisions
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
        var walk_status = '';
        if (cursors.left.isDown) {
            player.body.acceleration.x = -game.PLAYER_ACCELERATION;  
            walk_status = 'left';
        } else if (cursors.right.isDown) {
            player.body.acceleration.x = game.PLAYER_ACCELERATION;
            walk_status = 'right';
        } else {
            player.body.acceleration.x = 0;
            walk_status = '';
        }
        if (player.walk_status !== walk_status) {
            if (walk_status === 'left') player.animations.play('walkLeft', 10, true);
            if (walk_status === 'right') player.animations.play('walkRight', 10, true);
            if (walk_status === '') {
                if (player.walk_status === 'left') player.animations.play('stopWalkLeft', 20, false);
                else if (player.walk_status === 'right') player.animations.play('stopWalkRight', 20, false);
            }
            player.walk_status = walk_status;
        }

        // jumping; double jump and variable jump (variable doesnt seem to work)
        var isGrounded = player.body.touching.down;
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
        game.breath_display.setText(player.breath);
        if (player.breath <= 250) {
            if (time >= game.breath_display.blinkTimer + 500) {
                if (game.breath_display.isBig) {
                    game.breath_display.setStyle({font: '20px Arial', fill: 'red'});
                    game.breath_display.isBig = false;
                } else {
                    game.breath_display.setStyle({font: '16px Arial', fill: 'red'});
                    game.breath_display.isBig = true;
                }
                game.breath_display.blinkTimer = time;
            }
        } else {
            game.breath_display.setStyle({font: '16px Arial', fill: 'blue'})
        }


        // spawn gems
        if (time >= level.gemTimer + level.gem_frequency) {
            var gem = gems.getFirstExists(false);
            gem.reset(10+(level.world.width-20)*Math.random(), 320 + 60*Math.random());
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
                        game.updateMoney(-level.hot_turret.attr.cost*game.stats.price_mod/100);

                        var turret = level.hot_turret.getFirstExists(false);
                        turret.beingConstructed = true;
                        turret.reset(player.body.x + player.body.width/2, 0, turret.maxHealth);
                        turret.birthTime = null;
                        level.hot_turret.constrTurret = turret;
                    }
                }
            } else {
                if (time >= level.turretTimer+ game.TURRET_BUFFER_TIME + level.hot_turret.attr.constructTime) {
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


        // check pause button
        if (game.pause_button.input.pointerDown() || level.input.keyboard.isDown(80)) {
            game.isPaused = !game.isPaused;
        }
    };


    // -------------------- sprite and sprite groups -------------------------

    game.addSetting = function(level) {
        level.add.sprite(0, game.GROUND_Y-game.height, 'sky');
        level.add.sprite(126, game.GROUND_Y, 'ground_gradient');
        level.ground = game.add.group();

        var addGroundBlock = function(x, y, img_id) {
            var groundBlock = level.add.sprite(x, y, img_id);
            level.physics.arcade.enable(groundBlock);
            groundBlock.body.immovable = true;
            groundBlock.body.allowGravity = false;
            level.ground.add(groundBlock); 
        }

        for (var i = 0; i < game.width/21; i++) {
            if (i < 7 || (i > 9 && i < 30) || i > 32) {
                addGroundBlock(21*i, game.GROUND_Y, 'grass');
                addGroundBlock(21*i, game.GROUND_Y + 21, 'ground');
            }
            for (var j = 0; j < 2; j++) {
                if (i < 7 || i > 32) addGroundBlock(21*i, game.GROUND_Y + 21*(j+2), 'ground');
                addGroundBlock(21*i, game.GROUND_Y + 21*(j+4), 'ground');
            }
        }        
    }

    game.addPlayer = function(level) {
        // add player
        var player = level.add.sprite(level.world.centerX, game.GROUND_Y-50, 'guy', 1);
        player.animations.add('walkLeft', [12, 13, 14, 13], true);
        player.animations.add('walkRight', [24, 25, 26, 25], true);
        player.animations.add('stopWalkLeft', [9, 10, 11, 1], false);
        player.animations.add('stopWalkRight', [35, 34, 33, 1], false);
        player.walk_status = '';

        level.physics.arcade.enable(player);        
        player.anchor.setTo(0.5, 0.5);
        player.body.collideWorldBounds = true;
        player.body.maxVelocity.setTo(game.stats.speed, game.stats.speed * 10);
        player.body.drag.setTo(game.DRAG, 0);
        game.addHealthBar(player, game.stats.hp);
        game.player_hp_display.setText(player.health);

        player.water_bar_container = game.add.sprite(-16, -19, 'health_bar_container');
        player.water_bar = game.add.sprite(1, 1, 'water_bar');
        player.water_bar_container.addChild(player.water_bar);
        player.addChild(player.water_bar_container);
        player.maxBreath = 1000;
        player.breath = player.maxBreath;
        return player;
    }

    game.addSpaceships = function(level, num) {
        // need to prevent spaceships from overlapping with each other
        // also need to make firing bullets more random
        var spaceships = level.add.group();
        spaceships.enableBody = true;
        spaceships.physicsBodyType = Phaser.Physics.ARCADE;
        spaceships.createMultiple(num, 'spaceship');
        spaceships.setAll('anchor.x', 0.5);
        spaceships.setAll('anchor.y', 0.5);

        spaceships.forEach(function(spaceship) {
            spaceship.body.collideWorldBounds = true;
            spaceship.body.bounce.set(1);
            spaceship.fireTimer = game.time.now;
            spaceship.fireFreq = 2000;
            game.addHealthBar(spaceship, 3);

            spaceship.shoot = function() {
                var bullet = red_bullets.getFirstExists(false);
                bullet.reset(spaceship.body.x + spaceship.body.width/2, bullet.height + spaceship.body.y + spaceship.body.height);
                game.physics.arcade.moveToXY(bullet, spaceship.body.x + spaceship.body.width/2, game.height, 100);
            };

            spaceship.events.onKilled.add(function(s) {
                game.xp_bar.update(20);
            }, this);
        });

        for (var i = 0; i < num; i++) {
            var spaceship = spaceships.getFirstExists(false);
            spaceship.reset(level.world.randomX, 130+40*Math.random(), spaceship.maxHealth);
            spaceship.body.velocity.x = (80 + 40*Math.random()) * (2*Math.round(Math.random())-1);
            spaceship.body.allowGravity = false;
            spaceship.fireTimer = game.time.now;
        }
        return spaceships;
    }

    game.addTurret = function(level, index, img_id) {
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
            turret.body.maxVelocity.setTo(game.TURRET_MAX_SPEED, 1000);
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

    // -------------------------- displays -----------------------------------
    game.addDisplays = function() {
         // add hp display
        game.player_hp_display = this.add.text(5, 5, '', {font: '16px Arial'});  

        // add money display
        game.money_display = this.add.text(5, 30, '$' + game.money, {
            font: '16px Arial',
            fill: 'green'
        });
        
        // add breath display
        game.breath_display = this.add.text(5, 55, '', {
            font: '16px Arial',
            fill: 'blue'
        });
        game.breath_display.blinkTimer = game.time.now;

        // level display
        game.level_text = this.add.text(game.world.centerX, 32, 'Level 1', {
            font: '14px Arial'
        });
        game.level_text.anchor.setTo(0.5, 0.5);

        //add xp display
        game.xp_bar_container = this.add.sprite(game.world.centerX, 15, 'xp_bar_container');
        game.xp_bar_container.anchor.setTo(0.5, 0.5);
        game.xp_bar = this.add.sprite(0, 0, 'xp_bar');
        game.xp_bar.anchor.setTo(0.5, 0.5);
        game.xp_bar_container.addChild(game.xp_bar);
        game.xp_bar.update = function(incr) {
            if (incr) game.xp += incr;
            this.crop({
                x: 0,
                y: 0,
                width: 1.2*(game.xp % 100),
                height: 10
            });
            var level = 1 + Math.floor(game.xp/100)
            if (game.player_level !== level) {
                game.level_text.setText('Level ' + level);
            }
        }
        game.xp_bar.update();

        // add pause button
        game.pause_button = this.add.text(this.width-80, 10, 'pause (p)', {
            font: '16px Arial',
            cursor: 'pointer'
        });
        game.pause_button.inputEnabled = true;

        // add hotbar
        game.hotbar = this.add.sprite(20, game.height - 60, 'hotbar');
        game.hotbar_select = this.add.sprite(4, 4, 'hotbar_select');
        game.hotbar.addChild(game.hotbar_select);
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
