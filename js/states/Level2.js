Game.Level2 = function(game) {
    this.start_money = 300;
    this.num_spaceships = 2;
};

Game.Level2.prototype = {
    create: function() {
        this.game.createWorld(this);
    },
    
    update: function() {
        this.game.updateWorld(this, 'YouWin');
    }
};
