Game.PickClass = function (game) {
	this.music = null;
	this.playButton = null;
};

Game.PickClass.prototype = {
	create: function () {

		/*this.music = this.add.audio('titleMusic');
		this.music.play();*/

        this.stage.backgroundColor = '#FFF';

        this.text1 = this.add.text(this.world.centerX, this.world.centerY-30, 'Pick a class', {
        	font: '32px Arial'
        });
        this.text1.anchor.setTo(0.5, 0.5);
        this.text1.inputEnabled = true;
	},

	update: function () {
        if (this.text1.input.pointerDown()) {
        	//this.music.stop();
        	this.state.start('Level1');
        }
	},
};