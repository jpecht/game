var definePropertyFunctions = function(game) {

    // constants
    game.groundY = 500;
    game.drag = 700;
    game.player_maxSpeed = 200;
    game.player_acceleration = 1000;
    game.money = 0;

    // game displays
    game.addPauseButton = function() {
        game.pause_button = this.add.text(this.width-100, 10, 'Pause', {fontSize: '10px', cursor: 'pointer'});
        return game.pause_button;
    };
    game.addHPDisplay = function() {
        game.player_hp_display = this.add.text(5, 5, '10', {font: '16px Arial'});  
        return game.player_hp_display;      
    };
    game.addMoneyDisplay = function() {
        game.money_display = this.add.text(5, 30, '$1000', {font: '16px Arial', fill: 'green'});
        return game.money_display;
    };
    game.addHotbar = function() {

    };


    // general create and update
    game.createWorld = function(level) {
        // start physics engine
        level.physics.startSystem(Phaser.Physics.ARCADE);
        level.physics.arcade.checkCollision.down = false;
        
        // add setting
        level.add.sprite(0, 0, 'sky');
        ground = level.add.sprite(0, game.groundY, 'ground');
        level.physics.arcade.enable(ground);
        ground.body.immovable = true;
        ground.body.allowGravity = false;

        // add sprites
        player = level.add.sprite(level.world.centerX, game.groundY, 'guy');

        // spaceships
        spaceships = game.addSpaceships(level, 2);

        // add bullets
        red_bullets = level.add.group();
        blue_bullets = level.add.group();
        game.addBulletProperties(red_bullets, 'red_bullet');
        game.addBulletProperties(blue_bullets, 'blue_bullet');                                          

        // set player properties
        level.physics.arcade.enable(player);        
        player.anchor.setTo(0.5, 0.5);
        player.body.collideWorldBounds = true;
        player.body.maxVelocity.setTo(game.player_maxSpeed, game.player_maxSpeed);
        player.body.drag.setTo(game.drag, 0);
        player.maxHealth = 5;
        player.health = 5;
        game.addHealthBar(player, 5);
 
  
        // add turrets      
        blue_turrets = game.addBlueTurrets(level);


        game.addHPDisplay();

        game.money += level.start_money;
        game.addMoneyDisplay().text = '$' + level.game.money;
    };

    game.updateWorld = function(level, next_level_id) {
        var time = level.time.now;
        var hot_turret = blue_turrets;

        // update player movement
        cursors = level.input.keyboard.createCursorKeys();   
        if (cursors.left.isDown) {
            player.body.acceleration.x = -game.player_acceleration;  
        } else if (cursors.right.isDown) {
            player.body.acceleration.x = game.player_acceleration;
        } else {
            player.body.acceleration.x = 0;
        }
        
        // turret building
        if (cursors.down.isDown && !cursors.left.isDown && !cursors.right.isDown) {
            if (!hot_turret.beingConstructed) {
                // start to build turret
                hot_turret.beingConstructed = true;
                turretTimer = time;
            } else {
                // check to see if done building turret
                if (time >= turretTimer + hot_turret.attr.constructTime) {
                    hot_turret.addToWorld();
                    hot_turret.beingConstructed = false;
                }
            }
        } else {
            creatingTurret = false;
            hot_turret.beingConstructed = false;    
        }
        
        // enemy firing
        spaceships.forEachAlive(function(spaceship) {
            if (time > spaceship.fireTimer + spaceship.fireFreq) {
                spaceship.fireTimer = time;
                spaceship.shoot();
            }
        });
            
        // turrets firing
        blue_turrets.forEachAlive(function(turret) {
            if (time > turret.fireTimer + turret.fireFreq) {
                turret.fireTimer = time;
                turret.shoot();
            }
        }, level);
        
        
        // check if bullet collided with anyone; callback function doesnt seem to be calling in order
        level.physics.arcade.overlap(red_bullets, player, game.bulletHit);
        level.physics.arcade.overlap(blue_turrets, red_bullets, game.bulletHit);
        level.physics.arcade.overlap(spaceships, blue_bullets, game.bulletHit);

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


    // adding enemies
    game.addSpaceships = function(level, num) {
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
            spaceship.fireTimer = game.time.now;
        }
        return spaceships;
    }

    // properties for specific turrets
    game.addBlueTurrets = function(level) {
        var group = level.add.group();
        game.addTurretProperties(group, {
            img_id: 'blue_turret',
            constructTime: 2000,
            fireFreq: 1500,
            health: 3,
            cost: 100           
        });
        return group;
    };
    game.addGreenTurrets = function(level) {
        var group = level.add.group();
        game.addTurretProperties(group, {
            img_id: 'green_turret',
            fireFreq: 1000,
            health: 5,
            cost: 150
        });
        return group;
    };

    // properties that apply to groups
    game.addHealthBar = function(sprite, num) {
        sprite.maxHealth = num;
        sprite.health = num;
        sprite.health_bar_container = game.add.sprite(-16, -25, 'health_bar_container');
        sprite.health_bar = game.add.sprite(1, 1, 'health_bar');
        sprite.health_bar_container.addChild(sprite.health_bar);
        sprite.addChild(sprite.health_bar_container);
    };
    game.addBulletProperties = function(group, img_id) {
        group.enableBody = true;
        group.physicsBodyType = Phaser.Physics.ARCADE;
        group.createMultiple(30, img_id);
        group.setAll('anchor.x', 0.5);
        group.setAll('anchor.y', 1);
        group.setAll('outOfBoundsKill', true);
        group.setAll('checkWorldBounds', true);
    };
    game.addTurretProperties = function(group, attr) {
        group.attr = {};
        for (var ind in attr) group.attr[ind] = attr[ind];

        group.enableBody = true;
        group.physicsBodyType = Phaser.Physics.ARCADE;
        group.createMultiple(30, attr.img_id);
        group.setAll('anchor.x', 0.5);
        group.setAll('anchor.y', 0.5);
        group.addToWorld = function() {
            if (game.buySomething(attr.cost)) {
                var turret = group.getFirstExists(false);
                turret.reset(player.body.x + player.body.width/2, player.body.y + 30, turret.maxHealth); 
                turret.fireTimer = game.time.now;
                return turret;
            } else {
                return false;
            }
        };
        group.forEach(function(turret) {
            game.addHealthBar(turret, attr.health);
            turret.fireFreq = attr.fireFreq;
            turret.shoot = function() {
                var bullet = blue_bullets.getFirstExists(false);
                bullet.reset(turret.body.x + turret.body.width/2, turret.body.y);
                game.physics.arcade.moveToXY(bullet, turret.body.x + turret.body.width/2, 0, 100);            
            };
        }, this);               
    };


    // behaviors
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
                player.kill();
            }
        }
    };


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
