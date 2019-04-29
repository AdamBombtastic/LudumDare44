var SPRITE_KEYS = {

}
var loadState =  {
    
    preload: function() {
        var loadingLabel = game.add.text(10,10,"Loading Game Assets . . .", {font: "50px Arial", fill: "White"});
        
        //Progress
        game.load.onFileComplete.add( function (progress) {
            loadingLabel.text = "Loading Game Assets: " + progress + "%";
        },this);
        game.load.onLoadComplete.add(function (progress) {
            loadingLabel.text = "Done!";
        },this);

        /*game.load.image("battle_background",IMAGE_ASSET_PATH + "main_background.png");
        game.load.image("skill_overlay",IMAGE_ASSET_PATH + "test_enemy.png");

        //ANT-TWAN
        //game.load.spritesheet("ant_monster_all",IMAGE_ASSET_PATH + "ant_mon_all.png",372,464,25);
        game.load.spritesheet("ant_monster_all",IMAGE_ASSET_PATH + "ant_mon_all.png",279,348,36);*/

        //game.load.image("spr_foodKing", "./graphics/clubs.png");
        game.load.spritesheet("spr_bullets","./graphics/spr_bullets.png",28,28,4);
        game.load.spritesheet("spr_macros_lg","./graphics/spr_macro_lg.png",34,34,4);
        game.load.spritesheet("spr_macros","./graphics/spr_macros.png",24,20,4);
        game.load.spritesheet("spr_cannon","./graphics/spr_cannon.png",64,100,7);
        game.load.spritesheet("spr_qwer","./graphics/spr_qwer.png",64,100,4);
        game.load.spritesheet("spr_foodKing", "./graphics/spr_FoodKing.png",78,80,4);

        game.load.spritesheet("spr_people1","./graphics/spr_people1.png",60,66,32);
        game.load.spritesheet("spr_people2","./graphics/spr_people2.png",60,66,32);
        game.load.spritesheet("spr_people3","./graphics/spr_people3.png",60,66,32);

        game.load.spritesheet("ui_space","./graphics/ui_Space.png",284,28,2);
        game.load.spritesheet("ui_healthBar","./graphics/ui_healthBar.png",300,24,2);

        game.load.image("ui_frame","./graphics/ui_frame.png");

    },
        
    create: function() {

        game.state.start("menu",true,false,null);
    }
    
}