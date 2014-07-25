Game.MainMenu = function (game) {
	this.music = null;
	this.playButton = null;
};

Game.MainMenu.prototype = {
	create: function () {

		/*this.music = this.add.audio('titleMusic');
		this.music.play();*/

        this.stage.backgroundColor = '#FFF';

        this.titleText = this.add.text(this.world.centerX, this.world.centerY-60, 'GAME', {
        	font: '32px Arial'
        });
        this.titleText.anchor.setTo(0.5, 0.5);

        this.authorText = this.add.text(this.world.centerX, this.world.centerY-30, 'by Jefferson', {
        	font: '14px Arial'
        });
        this.authorText.anchor.setTo(0.5, 0.5);

        this.start_button = this.add.text(this.world.centerX, this.world.centerY+70, 'START', {
        	font: '24px Arial'
       	});
        this.start_button.anchor.setTo(0.5, 0.5);
        this.start_button.inputEnabled = true;
        this.start_button.buttonMode = true;

        var explanation_text = [];
        explanation_text[0] = 'Use the ARROW keys to move. Jump by pressing UP. You can double jump too ;)';
        explanation_text[1] = 'Hold the DOWN arrow to build a turret. Keep holding DOWN until its done building!';
        explanation_text[2] = 'Youll wanna be underground when building a turret. Otherwise itll fall on you and kill you =/';
        explanation_text[3] = 'Collect gems to earn money to build more turrets!';
        explanation_text[4] = 'Lastly, the air is toxic! You will run out of breath if you stay above ground for too long';
        for (var i = 0; i < explanation_text.length; i++) {
            var exp_text = this.add.text(this.world.centerX, this.world.centerY+150+25*i, explanation_text[i], {
                font: '16px Arial'
            });
            exp_text.anchor.setTo(0.5, 0.5);
        }
	},

	update: function () {
        if (this.start_button.input.pointerDown()) {
        	//this.music.stop();
        	this.state.start('PickClass');
        }
	},
};