Game.Level1 = function(game) {

};

/*var game,
    player,
    spaceship,
    blue_turrets,
    red_turrets,
    bullets,
*/

Game.Level1.prototype = {
    preload: function() {

    },
    
    create: function() {    
        // start physics engine
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.checkCollision.down = false;
        
        // add setting
        this.add.sprite(0, 0, 'sky');
        ground = this.add.sprite(0, this.game.groundY, 'ground');
        this.physics.arcade.enable(ground);
        ground.body.immovable = true;
        ground.body.allowGravity = false;

        // add sprites
        player = this.add.sprite(this.world.centerX, this.game.groundY, 'guy');
        spaceship = this.add.sprite(20, 150, 'spaceship');

        // add bullets
        red_bullets = this.add.group();
        blue_bullets = this.add.group();
        this.game.addBulletProperties(red_bullets, 'red_bullet');
        this.game.addBulletProperties(blue_bullets, 'blue_bullet');                                          

        // set player properties
        this.physics.arcade.enable(player);        
        player.anchor.setTo(0.5, 0.5);
        player.body.collideWorldBounds = true;
        player.body.maxVelocity.setTo(this.game.player_maxSpeed, this.game.player_maxSpeed);
        player.body.drag.setTo(this.game.drag, 0);
        player.maxHealth = 10;
        player.health = 10;
        this.game.addHealthBar(player);

        // set spaceship properties
        this.physics.arcade.enable(spaceship);
        spaceship.anchor.setTo(0.5, 0.5);
        spaceship.body.collideWorldBounds = true;
        spaceship.body.velocity.x = 100;   
        spaceship.body.bounce.set(1);
        spaceship.fireTimer = this.time.now;
        spaceship.fireFreq = 2000;
        spaceship.maxHealth = 5;
        spaceship.health = 5;
        spaceship.shoot = function() {
            var bullet = red_bullets.getFirstExists(false);
            bullet.reset(spaceship.body.x, spaceship.body.y + spaceship.body.height);
            //this.physics.arcade.moveToXY(bullet, spaceship.body.x, this.height, 100);
            this.game.physics.arcade.moveToXY(bullet, spaceship.body.x, this.game.height, 100);
        };
        this.game.addHealthBar(spaceship);
  
  
        // add turrets      
        red_turrets = this.add.group();
        blue_turrets = this.add.group();
        this.game.addTurretProperties(blue_turrets, {
            img_id: 'blue_turret',
            fireFreq: 1500,
            health: 5
        });

        this.game.addHPDisplay();
        this.game.addMoneyDisplay();
    },
    
    update: function() {
        var time = this.time.now;

        // update player movement
        cursors = this.input.keyboard.createCursorKeys();   
        if (cursors.left.isDown) {
            player.body.acceleration.x = -this.game.player_acceleration;  
        } else if (cursors.right.isDown) {
            player.body.acceleration.x = this.game.player_acceleration;
        } else {
            player.body.acceleration.x = 0;
        }
        
        // turret building
        if (cursors.down.isDown) {
            if (!creatingTurret) {
                // start to build turret
                creatingTurret = true;
                turretTimer = time;
            } else {
                // check to see if done building turret
                if (time >= turretTimer + 2000) {
                    creatingTurret = false;
                    blue_turrets.addToWorld();
                }
            }
        } else {
            creatingTurret = false;
        }
        
        // enemy firing
        if (time > spaceship.fireTimer + spaceship.fireFreq) {
            spaceship.fireTimer = time;
            spaceship.shoot();
        }
        
        // turrets firing
        blue_turrets.forEachAlive(function(turret) {
            if (time > turret.fireTimer + turret.fireFreq) {
                turret.fireTimer = time;
                turret.shoot();
            }
        }, this);
        
        
        // check if bullet collided with anyone; callback function doesnt seem to be calling in order
        this.physics.arcade.overlap(red_bullets, player, this.game.bulletHit);
        this.physics.arcade.overlap(blue_turrets, red_bullets, this.game.bulletHit);
        this.physics.arcade.overlap(blue_bullets, spaceship, this.game.bulletHit);
    }
};