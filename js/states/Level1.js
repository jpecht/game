Game.Level1 = function(game) {
    this.start_money = 300;
    this.num_spaceships = 2;
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

        // spaceships
        spaceships = this.game.addSpaceships(this, 2);

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
        player.maxHealth = 5;
        player.health = 5;
        this.game.addHealthBar(player, 5);
 
  
        // add turrets      
        blue_turrets = this.game.addBlueTurrets(this);


        this.game.addHPDisplay();

        this.game.money += this.start_money;
        this.game.addMoneyDisplay().text = '$' + this.game.money;
    },
    
    update: function() {
        var time = this.time.now;
        var hot_turret = blue_turrets;

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
        }, this);
        
        
        // check if bullet collided with anyone; callback function doesnt seem to be calling in order
        this.physics.arcade.overlap(red_bullets, player, this.game.bulletHit);
        this.physics.arcade.overlap(blue_turrets, red_bullets, this.game.bulletHit);
        this.physics.arcade.overlap(spaceships, blue_bullets, this.game.bulletHit);

        // check if all enemies are dead
        if (spaceships.countLiving() === 0) {
            var text = this.game.add.text(this.game.world.centerX, this.game.world.centerY, 'Level Over. Good fucking job.', {
                font: '32px Arial'
            });
            text.anchor.setTo(0.5, 0.5);

            // add a fade transition of the screen

            setTimeout(function() {
                this.game.state.start('Level2');
            }, 5000);
        }
    }
}