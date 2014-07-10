/**
 * @author Jefferson
 */

window.onload = function() {
	
	var groundY = 500;
	var player_maxSpeed = 200;
	var player_acceleration = 1000;
	var drag = 700;
	
	/*var game,
		player,
		spaceship,
		blue_turrets,
		red_turrets,
		bullets,
		player_hp_display;
	*/
    function preload() {
    	game.load.image('sky', 'img/clouds.png');
    	game.load.image('ground', 'img/grass.png');
		game.load.image('spaceship', 'img/ufo.png');
		game.load.image('red_bullet', 'img/red_shot.png');
		game.load.image('blue_bullet', 'img/blue_shot.png');
		game.load.image('blue_turret', 'img/blue_turret.png');
        game.load.image('guy', 'img/guy.png');
        //game.load.atlas('playersheet', 'img/playersheet.png', 'img/playersheet.json');
        game.load.image('health_bar', 'img/health_bar.png');
        game.load.image('health_bar_container', 'img/health_bar_container.png');
    }
    
    function create() {   	
		// start physics engine
    	game.physics.startSystem(Phaser.Physics.ARCADE);
    	game.physics.arcade.checkCollision.down = false;
    	
    	// add setting
    	game.add.sprite(0, 0, 'sky');
    	ground = game.add.sprite(0, groundY, 'ground');
        game.physics.arcade.enable(ground);
        ground.body.immovable = true;
        ground.body.allowGravity = false;

     	// add sprites
    	player = game.add.sprite(game.world.centerX, groundY, 'guy');
 		spaceship = game.add.sprite(20, 150, 'spaceship');

		// add bullets
		red_bullets = game.add.group();
 		blue_bullets = game.add.group();
 		addBulletProperties(red_bullets, 'red_bullet');
 		addBulletProperties(blue_bullets, 'blue_bullet');  				                        

        // set player properties
        game.physics.arcade.enable(player);        
        player.anchor.setTo(0.5, 0.5);
        player.body.collideWorldBounds = true;
        player.body.maxVelocity.setTo(player_maxSpeed, player_maxSpeed);
        player.body.drag.setTo(drag, 0);
        player.maxHealth = 10;
        player.health = 10;
        addHealthBar(player);

		// set spaceship properties
		game.physics.arcade.enable(spaceship);
		spaceship.anchor.setTo(0.5, 0.5);
		spaceship.body.collideWorldBounds = true;
		spaceship.body.velocity.x = 100;   
		spaceship.body.bounce.set(1);
 		spaceship.fireTimer = game.time.now;
 		spaceship.fireFreq = 2000;
 		spaceship.maxHealth = 5;
 		spaceship.health = 5;
 		spaceship.shoot = function() {
	    	var bullet = red_bullets.getFirstExists(false);
	    	bullet.reset(spaceship.body.x, spaceship.body.y + spaceship.body.height);
	    	game.physics.arcade.moveToXY(bullet, spaceship.body.x, game.height, 100);
	 	};
	 	addHealthBar(spaceship);
  
  
		// add turrets		
  		red_turrets = game.add.group();
 		blue_turrets = game.add.group();
 		addTurretProperties(blue_turrets, {
 			img_id: 'blue_turret',
 			fireFreq: 1500,
 			health: 5
 		});

    	// add pause button
    	//game.add.text(game.width-100, 10, 'Pause', {fontSize: '10px', cursor: 'pointer'}); 
    	
    	// add hp display
    	player_hp_display = game.add.text(5, 5, '10', {fontSize: '12px'});
    }
    
    function update() {
    	// update player movement
    	cursors = game.input.keyboard.createCursorKeys();  	
    	if (cursors.left.isDown) {
    		player.body.acceleration.x = -player_acceleration;	
    	} else if (cursors.right.isDown) {
    		player.body.acceleration.x = player_acceleration;
    	} else {
    		player.body.acceleration.x = 0;
    	}
    	
    	// turret building
    	if (cursors.down.isDown) {
    		if (!creatingTurret) {
    			// start to build turret
    			creatingTurret = true;
    			turretTimer = game.time.now;
    		} else {
    			// check to see if done building turret
    			if (game.time.now >= turretTimer + 2000) {
    				creatingTurret = false;
    				blue_turrets.addToWorld();
    			}
    		}
    	} else {
    		creatingTurret = false;
    	}
    	
    	// enemy firing
    	if (game.time.now > spaceship.fireTimer + spaceship.fireFreq) {
    		spaceship.fireTimer = game.time.now;
    		spaceship.shoot();
    	}
    	
    	// turrets firing
    	blue_turrets.forEachAlive(function(turret) {
    		if (game.time.now > turret.fireTimer + turret.fireFreq) {
    			turret.fireTimer = game.time.now;
    			turret.shoot();
    		}
    	}, this);
    	
    	
    	// check if bullet collided with anyone; callback function doesnt seem to be calling in order
    	game.physics.arcade.overlap(red_bullets, player, bulletHit);
    	game.physics.arcade.overlap(blue_turrets, red_bullets, bulletHit);
    	game.physics.arcade.overlap(blue_bullets, spaceship, bulletHit);
    }
          
    function bulletHit(hitee, bullet) {
    	bullet.kill();
    	hitee.health--;
    	if (hitee.health_bar) {    		
    		hitee.health_bar.crop({
    			x: 0,
    			y: 0, 
    			width: 32 * hitee.health / hitee.maxHealth,
    			height: hitee.health_bar.height
    		});
    	}
    	
    	if (hitee == player) {
    		player_hp_display.text = player.health;
    		if (player.health <= 0) {
    			player.kill();
    		}
    	}
    }
    
	// property definitions
	var addHealthBar = function(sprite) {
		sprite.health_bar_container = game.add.sprite(-16, -25, 'health_bar_container');
		sprite.health_bar = game.add.sprite(1, 1, 'health_bar');
		sprite.health_bar_container.addChild(sprite.health_bar);
		sprite.addChild(sprite.health_bar_container);
	};
	var addBulletProperties = function(group, img_id) {
 		group.enableBody = true;
 		group.physicsBodyType = Phaser.Physics.ARCADE;
		group.createMultiple(30, img_id);
 		group.setAll('anchor.x', 0.5);
 		group.setAll('anchor.y', 1);
 		group.setAll('outOfBoundsKill', true);
 		group.setAll('checkWorldBounds', true);
	};
	var addTurretProperties = function(group, attr) {
 		group.enableBody = true;
  		group.physicsBodyType = Phaser.Physics.ARCADE;
		group.createMultiple(30, attr.img_id);
 		group.setAll('anchor.x', 0.5);
 		group.setAll('anchor.y', 0.5);
 		group.addToWorld = function() {
	    	var turret = group.getFirstExists(false);
	    	turret.reset(player.body.x + player.body.width/2, player.body.y + 30, turret.maxHealth); 
	    	turret.fireTimer = game.time.now;		
 		};
 		group.forEach(function(turret) {
 			addHealthBar(turret);
 			turret.health = attr.health;
 			turret.maxHealth = attr.health;
 			turret.fireFreq = attr.fireFreq;
 			turret.shoot = function() {
	    		var bullet = blue_bullets.getFirstExists(false);
	    		bullet.reset(turret.body.x + turret.body.width/2, turret.body.y);
	    		game.physics.arcade.moveToXY(bullet, turret.body.x, 0, 100); 			
			};
 		}, this);	 			
	};

	var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-container', {
		preload: preload,
		create: create,
		update: update
	});
};




