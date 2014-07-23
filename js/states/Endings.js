Game.GameOver = function(game) {
};

Game.GameOver.prototype = {
	create: function() {
		this.stage.backgroundColor = '#FFF';
        this.text1 = this.add.text(this.world.centerX, this.world.centerY, 'Game Over... =(', {
        	font: '28px Arial'
        });
        this.text1.anchor.setTo(0.5, 0.5);

        this.start_again_timer = this.game.time.now;
        this.start_again_added = false;
	},

	update: function() {
		if (this.start_again_added === false && this.game.time.now >= this.start_again_timer + 3000) {
			this.text2 = this.add.text(this.world.centerX, this.world.centerY+100, 'Try Again?', {
				font: '20px Arial'
			});
			this.text2.anchor.setTo(0.5, 0.5);
			this.text2.inputEnabled = true;

			this.start_again_added = true;
		}

		if (this.start_again_added && this.text2.input.pointerDown()) {
			this.state.start('MainMenu');
		}
	}
};

Game.YouWin = function(game) {
};

Game.YouWin.prototype = {
	create: function() {
		this.stage.backgroundColor = '#FFF';
        this.text1 = this.add.text(this.world.centerX, this.world.centerY, 'Congrats! You Win!', {
        	font: '28px Arial'
        });
        this.text1.anchor.setTo(0.5, 0.5);
	},

	update: function() {

	}
};