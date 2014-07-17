Game.PickClass = function (game) {
	this.music = null;
	this.playButton = null;
    this.player_classes = [];
};

Game.PickClass.prototype = {
	create: function () {

		/*this.music = this.add.audio('titleMusic');
		this.music.play();*/

        this.player_classes.push(this.add.sprite(50, 25, 'class_builder'));
        this.player_classes.push(this.add.sprite(425, 25, 'class_ninja'));
        this.player_classes.push(this.add.sprite(50, 275, 'class_merchant'));
        this.player_classes.push(this.add.sprite(425, 275, 'class_tank'));
        for (var i = 0; i < this.player_classes.length; i++) {
            sprite = this.player_classes[i];
            sprite.inputEnabled = true;
            sprite.alpha = 0.5;
       }

        this.text1 = this.add.text(this.world.centerX, this.world.height-50, 'Pick a class', {
        	font: '24px Arial'
        });
        this.text1.anchor.setTo(0.5, 0.5);
        this.text1.inputEnabled = true;
	},

	update: function () {
        for (var i = 0; i < this.player_classes.length; i++) {
            var sprite = this.player_classes[i];
            if (sprite.input.pointerDown()) {
                //this.music.stop();
                this.state.start('Level1');
            } else if (sprite.input.pointerOver()) {
                sprite.alpha = 1;
            } else if (sprite.input.pointerOut()) {
                sprite.alpha = 0.5;
            }
        }
	}
};