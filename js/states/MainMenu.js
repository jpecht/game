Game.MainMenu = function (game) {
	this.music = null;
	this.playButton = null;
};

Game.MainMenu.prototype = {
	create: function () {

		/*this.music = this.add.audio('titleMusic');
		this.music.play();

		this.add.sprite(0, 0, 'titlepage');

		this.playButton = this.add.button(400, 600, 'playButton', this.startGame, this, 'buttonOver', 'buttonOut', 'buttonOver');
		*/

        this.stage.backgroundColor = '#FFF';
        this.start_button = this.add.text(this.world.centerX, this.world.centerY, 'START', {fontSize: '20px'});
        this.start_button.anchor.setTo(0.5, 0.5);
        this.start_button.inputEnabled = true;

	},

	update: function () {
        if (this.start_button.input.pointerDown()) {
        	//this.music.stop();
        	this.state.start('Level1');
        }
	},
};