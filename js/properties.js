var definePropertyFunctions = function(game) {
    game.bulletHit = function(hitee, bullet) {
        bullet.kill();
        hitee.health--;
        if (hitee.health_bar) {         
            hitee.health_bar.crop({
                x: 0,
                y: 0, 
                width: 32 * hitee.health / hitee.maxHealth,
                height: hitee.health_bar.height
            });
        }
        
        if (hitee == player) {
            player_hp_display.text = player.health;
            if (player.health <= 0) {
                player.kill();
            }
        }
    }

    // property definitions
    game.addHealthBar = function(sprite) {
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
        group.enableBody = true;
        group.physicsBodyType = Phaser.Physics.ARCADE;
        group.createMultiple(30, attr.img_id);
        group.setAll('anchor.x', 0.5);
        group.setAll('anchor.y', 0.5);
        group.addToWorld = function() {
            var turret = group.getFirstExists(false);
            turret.reset(player.body.x + player.body.width/2, player.body.y + 30, turret.maxHealth); 
            turret.fireTimer = game.time.now;       
            };
            group.forEach(function(turret) {
                game.addHealthBar(turret);
                turret.health = attr.health;
                turret.maxHealth = attr.health;
                turret.fireFreq = attr.fireFreq;
                turret.shoot = function() {
                var bullet = blue_bullets.getFirstExists(false);
                bullet.reset(turret.body.x + turret.body.width/2, turret.body.y);
                game.physics.arcade.moveToXY(bullet, turret.body.x, 0, 100);            
            };
        }, this);               
    };
}