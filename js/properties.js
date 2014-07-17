var definePropertyFunctions = function(game) {

    // constants
    game.groundY = 500;
    game.drag = 700;
    game.player_maxSpeed = 200;
    game.player_acceleration = 1000;
    game.money = 0;

    // game displays
    game.addPauseButton = function() {
        game.pause_button = this.add.text(this.width-100, 10, 'Pause', {fontSize: '10px', cursor: 'pointer'});
        return game.pause_button;
    };
    game.addHPDisplay = function() {
        game.player_hp_display = this.add.text(5, 5, '10', {font: '16px Arial'});  
        return game.player_hp_display;      
    };
    game.addMoneyDisplay = function() {
        game.money_display = this.add.text(5, 30, '$1000', {font: '16px Arial', fill: 'green'});
        return game.money_display;
    };
    game.addHotbar = function() {

    };

    // adding enemies
    game.addSpaceships = function(level, num) {
        spaceships = level.add.group();
        spaceships.enableBody = true;
        spaceships.physicsBodyType = Phaser.Physics.ARCADE;
        spaceships.createMultiple(30, 'spaceship');
        spaceships.setAll('anchor.x', 0.5);
        spaceships.setAll('anchor.y', 0.5);

        spaceships.forEach(function(spaceship) {
            spaceship.body.collideWorldBounds = true;
            spaceship.body.bounce.set(1);
            spaceship.fireTimer = game.time.now;
            spaceship.fireFreq = 2000;
            spaceship.shoot = function() {
                var bullet = red_bullets.getFirstExists(false);
                bullet.reset(spaceship.body.x + spaceship.body.width/2, bullet.height + spaceship.body.y + spaceship.body.height);
                game.physics.arcade.moveToXY(bullet, spaceship.body.x + spaceship.body.width/2, game.height, 100);
            };
            game.addHealthBar(spaceship, 3);
        });

        for (var i = 0; i < num; i++) {
            var spaceship = spaceships.getFirstExists(false);
            spaceship.reset(level.world.randomX, 150, spaceship.maxHealth);
            spaceship.body.velocity.x = 100;
            spaceship.fireTimer = game.time.now;
        }
        return spaceships;
    }


    // behaviors
    game.bulletHit = function(hitee, bullet) {
        bullet.kill();
        hitee.damage(1);
        if (hitee.health_bar) {         
            hitee.health_bar.crop({
                x: 0,
                y: 0, 
                width: 32 * hitee.health / hitee.maxHealth,
                height: hitee.health_bar.height
            });
        }
        
        if (hitee == player) {
            game.player_hp_display.setText(player.health);
            if (player.health <= 0) {
                player.kill();
            }
        }
    };


    // turrets
    game.addBlueTurrets = function(level) {
        var group = level.add.group();
        game.addTurretProperties(group, {
            img_id: 'blue_turret',
            constructTime: 2000,
            fireFreq: 1500,
            health: 3,
            cost: 100           
        });
        return group;
    };
    game.addGreenTurrets = function(level) {
        var group = level.add.group();
        game.addTurretProperties(group, {
            img_id: 'green_turret',
            fireFreq: 1000,
            health: 5,
            cost: 150
        });
        return group;
    };

    // property definitions
    game.addHealthBar = function(sprite, num) {
        sprite.maxHealth = num;
        sprite.health = num;
        sprite.health_bar_container = game.add.sprite(-16, -25, 'health_bar_container');
        sprite.health_bar = game.add.sprite(1, 1, 'health_bar');
        sprite.health_bar_container.addChild(sprite.health_bar);
        sprite.addChild(sprite.health_bar_container);
    };
    game.addBulletProperties = function(group, img_id) {
        group.enableBody = true;
        group.physicsBodyType = Phaser.Physics.ARCADE;
        group.createMultiple(30, img_id);
        group.setAll('anchor.x', 0.5);
        group.setAll('anchor.y', 1);
        group.setAll('outOfBoundsKill', true);
        group.setAll('checkWorldBounds', true);
    };
    game.addTurretProperties = function(group, attr) {
        group.attr = {};
        for (var ind in attr) group.attr[ind] = attr[ind];

        group.enableBody = true;
        group.physicsBodyType = Phaser.Physics.ARCADE;
        group.createMultiple(30, attr.img_id);
        group.setAll('anchor.x', 0.5);
        group.setAll('anchor.y', 0.5);
        group.addToWorld = function() {
            if (game.buySomething(attr.cost)) {
                var turret = group.getFirstExists(false);
                turret.reset(player.body.x + player.body.width/2, player.body.y + 30, turret.maxHealth); 
                turret.fireTimer = game.time.now;
                return turret;
            } else {
                return false;
            }
        };
        group.forEach(function(turret) {
            game.addHealthBar(turret, attr.health);
            turret.fireFreq = attr.fireFreq;
            turret.shoot = function() {
                var bullet = blue_bullets.getFirstExists(false);
                bullet.reset(turret.body.x + turret.body.width/2, turret.body.y);
                game.physics.arcade.moveToXY(bullet, turret.body.x + turret.body.width/2, 0, 100);            
            };
        }, this);               
    };

    game.buySomething = function(cost) {
        if (game.money >= cost) {
            game.money -= cost;
            if (game.money_display) game.money_display.setText('$' + game.money);
            return true;
        } else {
            // add "Need More Money" popup
            return false;
        }
    }
}
