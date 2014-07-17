Game.MainMenu = function (game) {
	this.music = null;
	this.playButton = null;
};

Game.MainMenu.prototype = {
	create: function () {

		/*this.music = this.add.audio('titleMusic');
		this.music.play();*/

        this.stage.backgroundColor = '#FFF';

        this.titleText = this.add.text(this.world.centerX, this.world.centerY-30, 'GAME', {
        	font: '32px Arial'
        });
        this.titleText.anchor.setTo(0.5, 0.5);

        this.authorText = this.add.text(this.world.centerX, this.world.centerY, 'by Jefferson', {
        	font: '14px Arial'
        });
        this.authorText.anchor.setTo(0.5, 0.5);

        this.start_button = this.add.text(this.world.centerX, this.world.centerY+100, 'START', {
        	font: '24px Arial'
       	});
        this.start_button.anchor.setTo(0.5, 0.5);
        this.start_button.inputEnabled = true;
        this.start_button.buttonMode = true;
	},

	update: function () {
        if (this.start_button.input.pointerDown()) {
        	//this.music.stop();
        	this.state.start('PickClass');
        }
	},
};