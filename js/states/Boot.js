var Game = {};

Game.Boot = function (game) {

};

Game.Boot.prototype = {
    preload: function () {
        //this.load.image('preloaderBackground', 'images/preloader_background.jpg');
        //this.load.image('preloaderBar', 'images/preloadr_bar.png');
    },

    create: function () {
        this.input.maxPointers = 1;

        if (this.game.device.desktop) {
            // Desktop specific settings
            this.scale.pageAlignHorizontally = true;
        } else {
            //  Mobile settings.
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.minWidth = 480;
            this.scale.minHeight = 260;
            this.scale.maxWidth = 1024;
            this.scale.maxHeight = 768;
            this.scale.forceLandscape = true;
            this.scale.pageAlignHorizontally = true;
            this.scale.setScreenSize(true);
        }

       this.state.start('Preloader');
    }
};