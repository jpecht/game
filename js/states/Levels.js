Game.Level1 = function(game) {
    this.start_money = 500;
    this.availTurrets = {
    	'blue_turret': true,
    	'green_turret': true
    };
    this.num_spaceships = 2;
    this.gem_frequency = 5000;
};

Game.Level1.prototype = {
    create: function() {
        this.game.createWorld(this);
    },
    
    update: function() {
        this.game.updateWorld(this, 'Level2');
    }
};

Game.Level2 = function(game) {
    this.start_money = 500;
    this.availTurrets = {
    	'blue_turret': true,
    	'green_turret': true
    };
     this.num_spaceships = 3;
};

Game.Level2.prototype = {
    create: function() {
        this.game.createWorld(this);
    },
    
    update: function() {
        this.game.updateWorld(this, 'YouWin');
    }
};
