Game.GameOver = function (game) {
};

Game.GameOver.prototype = {
	create: function () {
		this.stage.backgroundColor = '#FFF';
        this.text1 = this.add.text(this.world.centerX, this.world.centerY, 'Game Over... =(', {
        	font: '28px Arial'
        });
        this.text1.anchor.setTo(0.5, 0.5);
	},

	update: function () {

	}
};

Game.YouWin = function (game) {
};

Game.YouWin.prototype = {
	create: function () {
		this.stage.backgroundColor = '#FFF';
        this.text1 = this.add.text(this.world.centerX, this.world.centerY, 'Congrats! You Win!', {
        	font: '28px Arial'
        });
        this.text1.anchor.setTo(0.5, 0.5);
	},

	update: function () {

	}
};