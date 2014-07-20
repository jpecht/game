var definePropertyFunctions = function(game) {

    // ----------------------------- constants -------------------------------
    game.GROUND_Y = 500;
    game.GRAVITY = 2600;
    game.DRAG = 700;
    game.PLAYER_SPEED = 200;
    game.PLAYER_ACCELERATION = 1000;
    game.PLAYER_JUMP_SPEED = -700;
    
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
        level.ground = level.add.sprite(0, game.GROUND_Y, 'ground');
        level.physics.arcade.enable(level.ground);
        level.ground.body.immovable = true;
        level.ground.body.allowGravity = false;
 
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
        game.hotbar = level.add.sprite(50, game.height - 60, 'hotbar');
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


        // add gems
        gems = level.add.group();
        gems.enableBody = true;
        gems.physicsBodyType = Phaser.Physics.ARCADE;
        gems.createMultiple(30, 'gem');
        gems.setAll('anchor.x', 0.5);
        gems.setAll('anchor.y', 0.5);
        gems.setAll('body.allowGravity', false);

        gem = gems.getFirstExists(false);
        gem.reset(level.world.randomX, 370);
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

        
        // check turret building
       if (!level.inPostConstruct && cursors.down.isDown && !cursors.left.isDown && !cursors.right.isDown) {
            if (!level.constructing) {
                if (game.money >= level.hot_turret.attr.cost) {
                    // start to build turret
                    level.constructing = true;
                    level.turretTimer = time;

                    var turret = level.hot_turret.getFirstExists(false);
                    turret.beingConstructed = true;
                    turret.reset(player.body.x + player.body.width/2, 0, turret.maxHealth); 
                    level.hot_turret.constrTurret = turret;
                } else {
                    // cant afford that shit
                }
            } else {
                // check to see if done building turret
                if (time >= level.turretTimer + level.hot_turret.attr.constructTime) {
                    level.hot_turret.constrTurret.fireTimer = time;
                    level.hot_turret.constrTurret.beingConstructed = false;
                    level.constructing = false;
                    level.inPostConstruct = true;
                    game.money -= level.hot_turret.attr.cost;

                    level.hot_turret.constrText.destroy();
                } else {
                    var perc_constr = (time - level.turretTimer) / level.hot_turret.attr.constructTime;
                    /*level.hot_turret.constrTurret.crop({
                        x: 0,
                        y: (1 - perc_constr) * level.hot_turret.constrTurret.height,
                        width: level.hot_turret.constrTurret.width,
                        height: perc_constr * level.hot_turret.constrTurret.height
                    });*/

                    var constrText = game.add.text(0, 0, perc_constr.toFixed(2), {font: '14px Arial'});
                    level.hot_turret.constrTurret.addChild(constrText);
                    if (level.hot_turret.constrText) level.hot_turret.constrText.destroy();
                    level.hot_turret.constrText = constrText;
                }
            }
        } else {
            if (!cursors.down.isDown) level.inPostConstruct = false;
            if (level.constructing) {
                level.hot_turret.constrTurret.kill();
                level.constructing = false;
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
        //level.physics.arcade.collide(player, level.ground);
        level.physics.arcade.overlap(red_bullets, player, game.bulletHit);
        level.physics.arcade.overlap(gems, player, game.gotGem);
        level.physics.arcade.overlap(spaceships, blue_bullets, game.bulletHit);
        for (var i = 0; i < level.turrets.length; i++) {
            level.physics.arcade.collide(level.turrets[i], level.ground);
            level.physics.arcade.overlap(level.turrets[i], red_bullets, game.bulletHit);
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
                width: 32 * hitee.health / hitee.maxHealth,
                height: hitee.health_bar.height
            });
        }
        
        if (hitee == player) {
            game.player_hp_display.setText(player.health);
            if (player.health <= 0) {
                game.state.start('GameOver'); // need to test; might only work as level.state.start
            }
        }
    };
    game.gotGem = function(player, gem) {
        gem.kill();
        game.money += 100;
        game.money_display.setText('$' + game.money);
    }

    // -------------------------- miscellaneous ------------------------------
    game.buySomething = function(cost) {
        if (game.money >= cost) {
            game.money -= cost;
            if (game.money_display) game.money_display.setText('$' + game.money);
            return true;
        } else {
            // add "Need More Money" popup
            return false;
        }
    }
}
