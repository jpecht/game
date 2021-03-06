Game.Preloader = function (game) {
	this.background = null;
	this.preloadBar = null;
	this.ready = false;
};

Game.Preloader.prototype = {
	preload: function () {

		// from Boot.js
		//this.background = this.add.sprite(0, 0, 'preloaderBackground');
		//this.preloadBar = this.add.sprite(300, 400, 'preloaderBar');
		//this.load.setPreloadSprite(this.preloadBar);

		//	Here we load the rest of the assets our game needs.
		//	As this is just a Project Template I've not provided these assets, swap them for your own.
		/*this.load.image('titlepage', 'images/title.jpg');
		this.load.audio('titleMusic', ['audio/main_menu.mp3']);
		this.load.bitmapFont('caslon', 'fonts/caslon.png', 'fonts/caslon.xml');*/


		this.load.image('class_template', 'img/class_template.png');
		this.load.image('sidebar', 'img/sidebar.png');
		this.load.image('sidebar_arrow_left', 'img/sidebar_arrow_left.png');
		this.load.image('sidebar_arrow_right', 'img/sidebar_arrow_right.png');

    	this.load.image('sky', 'img/clouds.png');
    	this.load.image('grass', 'img/grass.png');
    	this.load.image('ground', 'img/ground.png');
    	this.load.image('ground_gradient', 'img/ground_gradient.png');
    	this.load.image('slope_right', 'img/slope_right.png');
    	this.load.image('slope_left', 'img/slope_left.png');

        this.load.spritesheet('guy', 'img/playersheet.png', 32, 32);
        
        this.load.atlas('atlas', 'img/spritesheet.png', 'img/spritesheet.json');

    	this.load.image('gem', 'img/gem.png');
		this.load.image('spaceship', 'img/ufo.png');
		this.load.image('red_bullet', 'img/red_shot.png');
		this.load.image('blue_bullet', 'img/blue_shot.png');
		this.load.image('blue_turret', 'img/blue_turret.png');
		this.load.image('green_turret', 'img/green_turret.png');

        this.load.image('hotbar', 'img/hotbar.png');
        this.load.image('hotbar_select', 'img/hotbar_select.png');
        this.load.image('health_bar', 'img/health_bar.png');
        this.load.image('health_bar_container', 'img/health_bar_container.png');
        this.load.image('water_bar', 'img/water_bar.png');
        this.load.image('xp_bar', 'img/xp_bar.png');
        this.load.image('xp_bar_container', 'img/xp_bar_container.png');
	},

	create: function () {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		//this.preloadBar.cropEnabled = false;

	},

	update: function () {

		//	You don't actually need to do this, but I find it gives a much smoother game experience.
		//	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
		//	You can jump right into the menu if you want and still play the music, but you'll have a few
		//	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
		//	it's best to wait for it to decode here first, then carry on.
		
		//	If you don't have any music in your game then put the game.state.start line into the create function and delete
		//	the update function completely.
		
		//if (this.cache.isSoundDecoded('titleMusic') && this.ready == false) {
			this.ready = true;
			this.state.start('MainMenu');
		//}
	}
};