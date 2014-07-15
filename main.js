/**
 * @author Jefferson
 */

window.onload = function() {
    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-container');
    game.state.add('Boot', Game.Boot);
    game.state.add('Preloader', Game.Preloader);
    game.state.add('MainMenu', Game.MainMenu);

    definePropertyFunctions(game);
    
    game.state.add('Level1', Game.Level1);

    game.state.start('Boot');
}