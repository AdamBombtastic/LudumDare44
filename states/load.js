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
        game.load.image("spr_cannon","./graphics/spr_cannon.png");
        game.load.spritesheet("spr_foodKing", "./graphics/spr_FoodKing.png",39,40,4);

    },
        
    create: function() {

        game.state.start("game",true,false,null);
    }
    
}