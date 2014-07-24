Game.PickClass = function (game) {
	this.music = null;
	this.playButton = null;
    this.player_classes = [];
};

Game.PickClass.prototype = {
	create: function () {

		/*this.music = this.add.audio('titleMusic');
		this.music.play();*/

        var builder = this.add.sprite(50, 25, 'class_template');
        var ninja = this.add.sprite(425, 25, 'class_template');
        var merchant = this.add.sprite(50, 275, 'class_template');
        var tank = this.add.sprite(425, 275, 'class_template');

        builder.stats = {
            hp: 5,
            speed: 200,
            build_speed_mod: 95,
            price_mod: 100            
        };
        ninja.stats = {
            hp: 5,
            speed: 210,
            build_speed_mod: 100,
            price_mod: 100            
        };
        merchant.stats = {
            hp: 5,
            speed: 200,
            build_speed_mod: 100,
            price_mod: 95
        };
        tank.stats = {
            hp: 6,
            speed: 200,
            build_speed_mod: 100,
            price_mod: 100            
        };

        this.player_classes = [builder, ninja, merchant, tank];
        var names = ['BUILDER', 'NINJA', 'MERCHANT', 'TANK'];

        for (var i = 0; i < this.player_classes.length; i++) {
            var sprite = this.player_classes[i];
            sprite.inputEnabled = true;
            sprite.alpha = 0.5;

            var name = this.add.text(sprite.width/2, 50, names[i], {font: '14px Arial'});
            name.anchor.setTo(0.5, 0.5);
            sprite.addChild(name);

            var health = this.add.text(50, 80, 'Health: ' + sprite.stats.hp, {font: '14px Arial'});
            var speed = this.add.text(50, 100, 'Speed: ' + sprite.stats.speed, {font: '14px Arial'});
            var build_speed = this.add.text(50, 120, 'Build Speed: ' + (200-sprite.stats.build_speed_mod), {font: '14px Arial'});
            var price_mod = this.add.text(50, 140, 'Price Modifier: ' + sprite.stats.price_mod, {font: '14px Arial'});
            sprite.addChild(health);
            sprite.addChild(speed);
            sprite.addChild(build_speed);
            sprite.addChild(price_mod);
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

                this.game.stats = {};
                for (var ind in sprite.stats) this.game.stats[ind] = sprite.stats[ind];

                this.state.start('Level1');
            } else if (sprite.input.pointerOver()) {
                sprite.alpha = 1;
            } else if (sprite.input.pointerOut()) {
                sprite.alpha = 0.5;
            }

        }
	}
};