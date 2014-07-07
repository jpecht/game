/**
 * @author Jefferson
 */

window.onload = function() {
	var groundY = 500;
	var player_maxSpeed = 200;
	var player_acceleration = 1000;
	var drag = 700;

    function preload() {
    	game.load.image('sky', 'img/clouds.png');
    	game.load.image('ground', 'img/grass.png');
		game.load.image('spaceship', 'img/ufo.png');
		game.load.image('blue_shot', 'img/blue_shot.png');
        game.load.image('guy', 'img/guy.png');
        //game.load.atlas('playersheet', 'img/playersheet.png', 'img/playersheet.json');
    }
    
    function create() {   	
    	game.physics.startSystem(Phaser.Physics.ARCADE);
    	game.physics.arcade.checkCollision.down = false;
    	
    	// add sprites
    	game.add.sprite(0, 0, 'sky');
    	ground = game.add.sprite(0, groundY, 'ground');
    	player = game.add.sprite(game.world.centerX, groundY, 'guy');
 		spaceship = game.add.sprite(20, 150, 'spaceship');
        
        // set sprite properties
        player.anchor.setTo(0.5, 0.5);
                
        // set ground properties
        game.physics.arcade.enable(ground);
        ground.body.immovable = true;
        ground.body.allowGravity = false;

        // set player properties
        game.physics.arcade.enable(player);        
        player.body.collideWorldBounds = true;
        player.body.maxVelocity.setTo(player_maxSpeed, player_maxSpeed);
        player.body.drag.setTo(drag, 0);

		// set spaceship properties
		game.physics.arcade.enable(spaceship);
		spaceship.body.collideWorldBounds = true;
		spaceship.body.velocity.x = 100;   
		spaceship.body.bounce.set(1);  
 
    	// add pause button
    	//game.add.text(game.width-100, 10, 'Pause', {fontSize: '10px', cursor: 'pointer'}); 
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
    	
    }

	var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-container', { preload: preload, create: create, update: update });
};




